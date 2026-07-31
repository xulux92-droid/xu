export function render(mount, ctx){
  mount.innerHTML = `
    <div class="tool-grid">
      <div class="card stack">
        <div class="label">Domain</div>
        <input id="robotsDomain" placeholder="https://domain.com" />
        <div class="label">Disallow paths (pisah baris)</div>
        <textarea id="robotsDisallow" placeholder="/admin/\n/tmp/"></textarea>
        <button class="action-btn primary" id="robotsRunBtn">Generate robots.txt</button>
      </div>
      <div class="code-box"><pre id="robotsResult">Robots.txt akan muncul di sini.</pre></div>
    </div>
  `;
  mount.querySelector('#robotsRunBtn').addEventListener('click', () => {
    const domain = mount.querySelector('#robotsDomain').value.trim();
    const disallow = mount.querySelector('#robotsDisallow').value.split(/\n+/).map(v=>v.trim()).filter(Boolean);
    const lines = ['User-agent: *'];
    if(disallow.length){ disallow.forEach(path => lines.push(`Disallow: ${path}`)); }
    else lines.push('Allow: /');
    if(domain) lines.push(`Sitemap: ${domain.replace(/\/$/,'')}/sitemap.xml`);
    mount.querySelector('#robotsResult').textContent = lines.join('\n');
  });
}
