# Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
# Author: Jimmy Kurian

@feeds
Feature: RSS feed and sitemap
  So that readers can subscribe and search engines can crawl every page
  As the site's author
  I want the feed and sitemap to list exactly the published pages

  Background:
    Given the production build of the site

  Scenario: The feed lists every published post, linking to a built page
    When I read the items in the RSS feed
    Then their links are the published posts' absolute URLs
    And every link is a page in the build

  Scenario: The feed describes its channel
    When I read the RSS feed's channel
    Then its title is "Jimmy Kurian, writing"
    And its link is the home page on the www host
    And its language is "en-us"

  Scenario: Each feed item has a title, description and publish date
    When I read the items in the RSS feed
    Then there is at least one item
    And each has a title, a description and a valid publish date

  Scenario: The sitemap index lists sitemaps that exist
    When I read the sitemap index
    Then it lists at least one sitemap
    And every one it lists is in the build

  Scenario: The sitemap lists every public page on the www host
    When I collect the URLs in every sitemap
    Then they are the home, privacy, reading and writing pages plus every published post, on the www host
    # The resume print page and the 404 page are left out.
