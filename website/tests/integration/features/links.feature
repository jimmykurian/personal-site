# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

@links
Feature: Internal links
  So that no visitor follows a link to nothing
  As the site's author
  I want every internal link, image, script and anchor to resolve within the build

  Background:
    Given the production build of the site

  Scenario: Everything a page links to exists in the build
    When I collect every internal URL each page references, from links, images, scripts and styles
    Then each one resolves to a file in the build
    # /resume.pdf is printed after the build, so it's left out.

  Scenario: Every #anchor has a matching id
    When I collect every same-site link with a #fragment
    Then each fragment matches an id on its target page

  Scenario: Internal page links end with a slash, like the canonical URLs
    When I collect the internal page links, without file extensions
    Then none of them is missing its trailing slash
