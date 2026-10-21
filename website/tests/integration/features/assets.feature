# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

@assets
Feature: Assets served from the site
  So that the live site makes no third-party requests
  As a visitor
  I want fonts, styles, scripts and images to come from jimmykurian.me itself

  Background:
    Given the production build of the site

  Scenario: Pages load nothing from another host
    When I collect the sources of every page's images, scripts, stylesheets and preloads
    Then none of them is on another host

  Scenario: Fonts are bundled, with no font CDN
    When I list the built font files
    Then there is at least one woff2 file
    And no page or stylesheet mentions Google's font hosts

  Scenario: Goodreads covers are downloaded at build time
    When I collect the cover images on the reading page
    Then there is at least one
    And every one is served from /_astro/
    And the page doesn't hot-link Goodreads' image host

  Scenario: Every image has alt text
    When I collect every image on every page
    Then each has an alt attribute, empty only when it's decorative

  Scenario: The favicon and the default link-preview image ship
    When I list the built files
    Then "/favicon.svg" and "/og-default.png" are among them
