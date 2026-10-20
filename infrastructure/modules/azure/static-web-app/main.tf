resource "azurerm_static_web_app" "this" {
  name                = var.name
  resource_group_name = var.resource_group_name
  location            = var.location
  sku_tier            = var.sku
  sku_size            = var.sku

  preview_environments_enabled       = var.preview_environments_enabled
  configuration_file_changes_enabled = true
  public_network_access_enabled      = true

  # GitHub Actions deploys with the API key, which sets the repository link in Azure.
  lifecycle {
    ignore_changes = [repository_url, repository_branch]
  }
}

resource "azurerm_static_web_app_custom_domain" "this" {
  for_each = var.custom_domains

  static_web_app_id = azurerm_static_web_app.this.id
  domain_name       = each.key
  validation_type   = each.value

  # Azure doesn't return the validation type, so an imported domain would otherwise be
  # replaced, unbinding it from the site until it validates again.
  lifecycle {
    ignore_changes = [validation_type]
  }
}
