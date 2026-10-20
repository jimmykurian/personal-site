terraform {
  required_version = ">= 1.11"

  required_providers {
    azurerm = {
      source  = "registry.opentofu.org/hashicorp/azurerm"
      version = "~> 5.8.0"
    }
  }
}
