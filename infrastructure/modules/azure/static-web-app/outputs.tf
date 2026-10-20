output "id" {
  description = "ID of the Static Web App."
  value       = azurerm_static_web_app.this.id
}

output "default_host_name" {
  description = "The app's azurestaticapps.net host, the target for DNS records."
  value       = azurerm_static_web_app.this.default_host_name
}

output "api_key" {
  description = "Deploy token for the app."
  value       = azurerm_static_web_app.this.api_key
  sensitive   = true
}

output "validation_tokens" {
  description = "TXT validation token for each custom domain. Empty once a domain is validated, and always empty for CNAME validation."
  value       = { for domain, d in azurerm_static_web_app_custom_domain.this : domain => d.validation_token }
  sensitive   = true
}

output "name" {
  description = "Name of the Static Web App."
  value       = azurerm_static_web_app.this.name
}

output "sku" {
  description = "Plan of the Static Web App."
  value       = azurerm_static_web_app.this.sku_tier
}

output "custom_domains" {
  description = "Bound custom domains, mapped to their validation type."
  value       = { for domain, d in azurerm_static_web_app_custom_domain.this : domain => d.validation_type }
}
