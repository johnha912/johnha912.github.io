# Domain Migration — johnha.info: Google Sites → GitHub Pages (via Namecheap)

**Who does this:** John (the owner) personally. No agent — not Claude Code, not the devops agent — ever touches DNS or registrar settings. The devops agent prepares the site side (GitHub Actions deploy + the `CNAME` file); every step below is yours.

**When:** Only AFTER Gate 3 — the new site is built, deployed, and verified working at **https://johnha912.github.io**. Until you change DNS, `johnha.info` keeps showing the OLD Google Sites page. The moment DNS propagates, visitors get the new site. There is no way to run both on the same domain, so don't start this until the new site is finished.

**Time needed:** ~15 minutes of clicking, then waiting. GitHub Docs state DNS changes can take up to 24 hours to propagate (in practice Namecheap changes usually show within minutes to a few hours). The HTTPS certificate can take up to ~24 hours after DNS verifies.

---

## Before you start

- [ ] New site confirmed working at https://johnha912.github.io (open it on your phone AND your PC).
- [ ] You can log in to **namecheap.com** (the registrar where you bought `johnha.info`).
- [ ] Optional but smart: take a screenshot of your current Namecheap DNS records before deleting anything, so you can undo if needed.

## Step 1 — Tell GitHub the domain is coming

1. Go to your repo `johnha912.github.io` on GitHub → **Settings** → **Pages**.
2. Under **Custom domain**, type `johnha.info` and click **Save**.
3. GitHub runs a DNS check — it will fail or show "not verified" at first. That's expected; it passes after Step 2 propagates.

(The repo also contains a `CNAME` file with exactly `johnha.info` in it, created by the devops agent. Keep it — with the GitHub Actions deploy workflow, that file is what keeps the custom domain attached on every deploy.)

## Step 2 — Replace the DNS records at Namecheap

1. Log in to Namecheap → **Domain List** → find `johnha.info` → **Manage** → **Advanced DNS** tab.
2. **Delete the old Google Sites records:**
   - Any **A record** with host `@` that does NOT point to one of the four GitHub IPs below.
   - The **CNAME record** with host `www` pointing to `ghs.googlehosted.com` (that's Google Sites) — you'll replace it in step 4.
   - Any **URL Redirect / parking records** Namecheap added by default for `@` or `www` — remove them, they conflict with A/CNAME records.
   - Leave MX records alone if you ever set up email for this domain.
3. **Add four A records** (host `@`, TTL = Automatic), one for each GitHub Pages IP:

   | Type | Host | Value |
   |------|------|-------|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

4. **Add the www CNAME:**

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | CNAME | www | johnha912.github.io | Automatic |

   This makes `www.johnha.info` work too; GitHub automatically redirects between the apex and www versions.

5. **Optional — IPv6:** add four AAAA records (host `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`. GitHub recommends using A records in addition to AAAA, which you've already done.

6. Save. Propagation starts now.

## Step 3 — Wait, then verify

1. Check propagation any time at https://dnschecker.org (enter `johnha.info`, type A) — you're waiting to see the four 185.199.x.x IPs.
2. Open **https://johnha.info** — once it loads the NEW site, DNS has switched for you. Try **https://www.johnha.info** too.
3. Back in GitHub → repo **Settings** → **Pages**: the DNS check should now pass.
4. **Turn on HTTPS:** in the same Pages settings, check **Enforce HTTPS**. If the checkbox is greyed out, the certificate is still provisioning — wait and check back within 24 hours; don't do the launch announcement until HTTPS works.

## Step 4 — Retire the old site (after the new one is confirmed live on the domain)

- In Google Sites, you can unpublish the old site or simply leave it — it no longer receives the domain's traffic, and it stays reachable only via its `sites.google.com` address. Leave it up for a week as a fallback before unpublishing, in case anything needs rescuing.
- Update links you control (LinkedIn profile website field, resume, email signature) — they already point to `johnha.info`, which now serves the new site, so in most cases nothing changes.

## If something goes wrong

- **Old site still showing after several hours:** you're seeing cached DNS. Check dnschecker.org from the table above; if the IPs are right there, just wait — your ISP/phone cache will catch up. Try phone-on-cellular vs PC-on-Wi‑Fi; they often update at different times.
- **GitHub says "domain not verified" / check fails:** re-check Namecheap for typos — the four A records must be host `@`, and no leftover redirect/parking record may exist for `@` or `www`.
- **Need to roll back:** re-add the old Google records (your pre-change screenshot has them) and remove the GitHub ones. Google Sites will resume serving the domain after propagation.

*Values verified against GitHub Docs, "Managing a custom domain for your GitHub Pages site" / "Configuring an apex domain," October 2026.*
