terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.110.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  project_name = var.project_name
}

resource "aws_cognito_user_pool" "this" {
  name                     = "${local.project_name}-user-pool"
  mfa_configuration        = "OFF"
  deletion_protection      = "INACTIVE"
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }

  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = false

    string_attribute_constraints {
      min_length = 5
      max_length = 2048
    }
  }

}

resource "aws_cognito_user_pool_domain" "this" {
  domain       = var.user_pool_domain_prefix
  user_pool_id = aws_cognito_user_pool.this.id
  managed_login_version = var.managed_login_version
}

resource "aws_cognito_managed_login_branding" "this" {
  user_pool_id = aws_cognito_user_pool.this.id
  client_id    = aws_cognito_user_pool_client.this.id

  use_cognito_provided_values = true
}

resource "aws_cognito_user_pool_client" "this" {
  name            = "${local.project_name}-spa-client"
  user_pool_id    = aws_cognito_user_pool.this.id
  generate_secret = false

  prevent_user_existence_errors = "ENABLED"
  refresh_token_validity        = 30
  access_token_validity         = 60
  id_token_validity             = 60
  auth_session_validity         = 3
  enable_token_revocation       = true
  allowed_oauth_flows_user_pool_client = true

  token_validity_units {
    access_token = "minutes"
    id_token     = "minutes"
    refresh_token = "days"
  }

  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]

  supported_identity_providers = ["COGNITO"]
  callback_urls                = var.callback_urls
  logout_urls                  = var.logout_urls

  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = [
    "email",
    "openid",
    "profile"
  ]
}

resource "aws_cognito_identity_pool" "this" {
  identity_pool_name               = "${local.project_name}-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.this.id
    provider_name           = aws_cognito_user_pool.this.endpoint
    server_side_token_check = true
  }
}

data "aws_iam_policy_document" "assume_authenticated" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = ["cognito-identity.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "cognito-identity.amazonaws.com:aud"
      values   = [aws_cognito_identity_pool.this.id]
    }

    condition {
      test     = "ForAnyValue:StringLike"
      variable = "cognito-identity.amazonaws.com:amr"
      values   = ["authenticated"]
    }
  }
}

data "aws_iam_policy_document" "authenticated_inline" {
  statement {
    sid    = "AllowCognito"
    effect = "Allow"
    actions = [
      "mobileanalytics:PutEvents",
      "cognito-sync:*",
      "cognito-identity:*"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role" "authenticated" {
  name               = "${local.project_name}-authenticated"
  assume_role_policy = data.aws_iam_policy_document.assume_authenticated.json
}

resource "aws_iam_role_policy" "authenticated" {
  role   = aws_iam_role.authenticated.id
  policy = data.aws_iam_policy_document.authenticated_inline.json
}

resource "aws_cognito_identity_pool_roles_attachment" "this" {
  identity_pool_id = aws_cognito_identity_pool.this.id

  roles = {
    authenticated = aws_iam_role.authenticated.arn
  }
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.this.id
}

output "cognito_user_pool_client_id" {
  value = aws_cognito_user_pool_client.this.id
}

output "cognito_identity_pool_id" {
  value = aws_cognito_identity_pool.this.id
}

output "cognito_user_pool_domain" {
  value = aws_cognito_user_pool_domain.this.domain
}
