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
| azurerm_resource_group.this | resource |

## Inputs

| Name | Description | Type | Default | Required |
| ---- | ----------- | ---- | ------- | :------: |
| <a name="input_location"></a> [location](#input\_location) | Azure region for the resource group. | `string` | n/a | yes |
| <a name="input_name"></a> [name](#input\_name) | Name of the resource group. | `string` | n/a | yes |

## Outputs

| Name | Description |
| ---- | ----------- |
| <a name="output_id"></a> [id](#output\_id) | ID of the resource group. |
| <a name="output_location"></a> [location](#output\_location) | Region of the resource group. |
| <a name="output_name"></a> [name](#output\_name) | Name of the resource group. |
<!-- END_TF_DOCS -->