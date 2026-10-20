# Licenses

`task lint:licenses` checks the license of every package installed in `website/node_modules`
(`website/scripts/check-licenses.mjs`). It reads each package's `package.json`, so it needs no
network.

- `allowed.txt`: the SPDX license ids allowed. In a compound expression, `OR` needs one allowed
  side and `AND` needs every side; `X WITH exception` counts as `X`.
- `excluded.txt`: packages exempt from the list, each with its reason. An exclusion that no
  longer matches an installed package fails the check.

A package with a license outside the list, or with none, fails the build. Add its license to
`allowed.txt` only if it's permissive; otherwise exclude the package with a reason, or replace it.
