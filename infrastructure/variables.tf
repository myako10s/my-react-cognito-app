variable "project_name" {
  type        = string
  description = "Prefix used for Cognito resources."
  default     = "my-react-cognito-app"
}

variable "aws_region" {
  type        = string
  description = "AWS region where Cognito is deployed."
  default     = "ap-northeast-1"
}

variable "callback_urls" {
  type        = list(string)
  description = "Allowed callback URLs for the user pool app client."
  default     = [
    "http://localhost:5173"
  ]
}

variable "logout_urls" {
  type        = list(string)
  description = "Allowed logout URLs for the user pool app client."
  default     = [
    "http://localhost:5173"
  ]
}

variable "user_pool_domain_prefix" {
  type        = string
  description = "Unique prefix for the Cognito managed login (Hosted UI) domain (cannot include reserved words such as 'cognito')."
  default     = "my-react-app-hosted"
}

variable "managed_login_version" {
  type        = string
  description = "Managed login version identifier returned by AWS (see `ManagedLoginVersion` in `describe-user-pool`). Leave null to accept the AWS default."
  default     = 2
}
