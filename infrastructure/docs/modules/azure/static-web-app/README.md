<!-- BEGIN_TF_DOCS -->
## Requirements

| Name | Version |
| ---- | ------- |
| <a name="requirement_terraform"></a> [terraform](#requirement\_terraform) | >= 1.11 |
| <a name="requirement_azurerm"></a> [azurerm](#requirement\_azurerm) | ~> 5.8.0 |

## Providers

| Name | Version |
| ---- | ------- |
| <a name="provider_azurerm"></a> [azurerm](#provider\_azurerm) | 5.8.0 |

## Modules

No modules.

## Resources

| Name | Type |
| ---- | ---- |
| azurerm_static_web_app.this | resource |
| azurerm_static_web_app_custom_domain.this | resource |

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_location"></a> [location](#input\_location) | Azure region for the Static Web App. | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | Name of the Static Web App. | `string` | n/a | yes |
| <a name="input_resource_group_name"></a> [resource\_group\_name](#input\_resource\_group\_name) | Resource group that holds the Static Web App. | `string` | n/a | yes |
| <a name="input_custom_domains"></a> [custom\_domains](#input\_custom\_domains) | Custom domains to bind, mapped to their validation type. Apex domains must use dns-txt-token. | `map(string)` | `{}` | no |
| <a name="input_preview_environments_enabled"></a> [preview\_environments\_enabled](#input\_preview\_environments\_enabled) | Deploy each pull request to its own preview environment. | `bool` | `true` | no |
| <a name="input_sku"></a> [sku](#input\_sku) | Plan for the Static Web App: Free or Standard. | `string` | `"Free"` | no |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_api_key"></a> [api\_key](#output\_api\_key) | Deploy token for the app. |
| <a name="output_custom_domains"></a> [custom\_domains](#output\_custom\_domains) | Bound custom domains, mapped to their validation type. |
| <a name="output_default_host_name"></a> [default\_host\_name](#output\_default\_host\_name) | The app's azurestaticapps.net host, the target for DNS records. |
| <a name="output_id"></a> [id](#output\_id) | ID of the Static Web App. |
| <a name="output_name"></a> [name](#output\_name) | Name of the Static Web App. |
| <a name="output_sku"></a> [sku](#output\_sku) | Plan of the Static Web App. |
| <a name="output_validation_tokens"></a> [validation\_tokens](#output\_validation\_tokens) | TXT validation token for each custom domain. Empty once a domain is validated, and always empty for CNAME validation. |
<!-- END_TF_DOCS -->