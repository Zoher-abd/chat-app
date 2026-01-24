window.addEventListener("load", () => {
  const base = (window.__BASE && window.__BASE !== "" ? window.__BASE : ".").replace(/\/$/, "");

  // SSE connect
  const source = new EventSource(`${base}/events`);
  source.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch {
      return;
    }

    if (data.op === "refresh") {
      window.location.reload();
    }
  };

  // Chat submit => urlencoded (damit req.body sicher da ist)
  const form = document.getElementById("chat-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const roomId = form.querySelector('input[name="roomId"]').value;
    const input = document.getElementById("chat-text");
    const text = input.value.trim();
    if (!text) return;

    input.value = "";

    const body = new URLSearchParams();
    body.set("roomId", roomId);
    body.set("text", text);

    await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  });
});
