# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

@deploy
Feature: Hosting config and robots.txt
  So that Azure Static Web Apps serves the site as intended
  As the site's author
  I want the hosting config and robots.txt deployed with the build

  Background:
    Given the production build of the site

  Scenario: The Static Web Apps config is copied into the build
    When I list the built files
    Then "/staticwebapp.config.json" is among them

  Scenario: Missing URLs get the built 404 page
    When I read the Static Web Apps config
    Then a 404 is rewritten to "/404.html" with status 404
    And the build has that page

  Scenario: Files are served without a trailing-slash redirect
    When I read the Static Web Apps config
    Then trailingSlash is "auto"

  Scenario: Every response gets the security headers
    When I read the Static Web Apps config
    Then the global headers are exactly Permissions-Policy, Referrer-Policy and X-Content-Type-Options
    And X-Content-Type-Options is "nosniff"

  Scenario: Only the hashed assets are cached for a year
    When I read the Static Web Apps config
    Then the only immutable route is "/_astro/*"
    And the build has files under /_astro/

  Scenario Outline: robots.txt blocks the <bot> training crawler
    When I read the groups in robots.txt
    Then the group for "<bot>" disallows everything

    Examples:
      | bot                |
      | GPTBot             |
      | ClaudeBot          |
      | Google-Extended    |
      | CCBot              |
      | Applebot-Extended  |
      | Meta-ExternalAgent |
      | Bytespider         |

  Scenario: robots.txt allows everyone else and points at the sitemap
    When I read the groups in robots.txt
    Then the group for every other user agent allows everything
    And robots.txt names the sitemap index, which the build has
