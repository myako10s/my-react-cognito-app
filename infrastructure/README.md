## Cognito infrastructure

Terraform module that provisions a Cognito User Pool, managed login (Hosted UI) domain, SPA client, Identity Pool, and Managed Login branding (LIGHT theme) in the Tokyo region (`ap-northeast-1`).

### Usage

```bash
cd infrastructure
terraform init
terraform apply \
  -var project_name=my-react-cognito-app \
  -var callback_urls='["https://localhost:5173"]' \
  -var logout_urls='["https://localhost:5173/logout"]' \
  -var user_pool_domain_prefix=my-react-app-hosted \
  -var managed_login_version="managed-login_2024-05-01"
```

Outputs:

- `cognito_user_pool_id`
- `cognito_user_pool_client_id`
- `cognito_identity_pool_id`
- `cognito_user_pool_domain`

> Note: The `user_pool_domain_prefix` (and consequently the full managed login / Hosted UI domain) cannot include reserved words such as `cognito`. Choose a unique prefix like `my-react-app-hosted`.
> 
> For `managed_login_version`, pass the exact string reported in `ManagedLoginVersion` when running `aws cognito-idp describe-user-pool --user-pool-id <ID>`. Leaving it unset (null) lets AWS keep the default classic login. Setting it ensures Terraform consistently chooses the managed login experience.
