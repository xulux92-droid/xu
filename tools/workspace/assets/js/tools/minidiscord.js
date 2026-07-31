export function render(){
  return `
    <section class="card" style="padding:0;overflow:hidden;height:calc(100vh - 170px);min-height:720px">
      <iframe
        src="mini-discord.html"
        title="Mini Discord"
        style="width:100%;height:100%;border:0;display:block;background:#111b21"
        allow="camera; microphone; autoplay; clipboard-read; clipboard-write; display-capture"
      ></iframe>
    </section>
  `;
}
