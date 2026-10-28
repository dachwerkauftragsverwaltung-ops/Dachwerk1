/* DACHWERK1-only Marketing Studio UI. Does not write to Supabase tables/storage. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
  const MAX_EDGE_IMAGE_CHARS = 7_000_000;
  const styles = {
    realistisch: {
      label: 'Realistisch optimiert',
      prompt: 'Edit the supplied real roofing contractor photograph into a natural, professional, photorealistic commercial photograph. Preserve the exact building, roof geometry, roof tiles/materials, visible workmanship, objects and camera perspective. Do not add or remove roof features, windows, chimneys, gutters, workers, tools, or construction details. Improve exposure, white balance, clarity, contrast and natural sky/light only. No text, no logo, no watermark, no graphic overlays. It must remain a truthful representation of the photographed job.'
    },
    werblich: {
      label: 'Werbemotiv',
      prompt: 'Create a premium, photorealistic advertising-style image based on the supplied roofing contractor photo, with polished commercial lighting, refined contrast, a tasteful cinematic sky and a clean professional atmosphere. Preserve the actual building and roof geometry, roof tiles/materials, workmanship and camera perspective as faithfully as possible. Do not invent structural details, windows, chimneys, gutters, workers or tools. No text, no logo, no watermark, no graphic overlays. The result must still depict the real photographed roofing project.'
    }
  };
  const formats = {
    beitrag: { label: 'Instagram-Beitrag 4:5', size: '1024*1280', ratio: '4 / 5' },
    story: { label: 'Instagram-Story 9:16', size: '720*1280', ratio: '9 / 16' }
  };
  let sourceDataUrl = '';
  let sourceName = '';
  let generating = false;
  let activeObjectUrls = [];

  function setStatus(text, isError = false) {
    const el = $('marketingStatus');
    if (el) { el.textContent = text; el.style.color = isError ? '#a12b2b' : ''; }
  }
  function setProgress(done, total, text) {
    $('marketingProgress').hidden = false;
    $('marketingProgressBar').style.width = `${Math.round(done / total * 100)}%`;
    $('marketingProgressText').textContent = text;
  }
  function setBusy(busy) {
    generating = busy;
    $('marketingGenerate').disabled = busy || !sourceDataUrl;
    $('marketingPhoto').disabled = busy;
    $('marketingRemovePhoto').disabled = busy;
  }
  function revokeOutputUrls() {
    activeObjectUrls.forEach(URL.revokeObjectURL);
    activeObjectUrls = [];
  }
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Das Foto konnte nicht gelesen werden.'));
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
  }
  async function compressImage(file) {
    if (!file || !/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('Bitte ein JPG-, PNG- oder WebP-Bild auswählen.');
    if (file.size > MAX_SOURCE_BYTES) throw new Error('Das Ausgangsfoto darf maximal 10 MB groß sein.');
    const originalData = await fileToDataUrl(file);
    const img = new Image();
    const loaded = new Promise((resolve, reject) => { img.onload = resolve; img.onerror = () => reject(new Error('Das Bildformat konnte nicht verarbeitet werden.')); });
    img.src = originalData;
    await loaded;
    const maxDim = 1600;
    const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Bildbearbeitung wird in diesem Browser nicht unterstützt.');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // JPEG conversion strips metadata and keeps the request body small.
    let result = canvas.toDataURL('image/jpeg', 0.86);
    if (result.length > MAX_EDGE_IMAGE_CHARS) result = canvas.toDataURL('image/jpeg', 0.72);
    if (result.length > MAX_EDGE_IMAGE_CHARS) throw new Error('Das Foto ist auch nach der Komprimierung zu groß. Bitte ein kleineres Foto wählen.');
    return result;
  }
  async function invokeFunction(body) {
    const client = window.dachwerkSupabase;
    if (!client || !window.dachwerkUser || !window.dachwerkProfile?.approved) {
      throw new Error('Bitte mit einem freigegebenen DACHWERK-Konto anmelden.');
    }
    const { data, error } = await client.functions.invoke('dachwerk-marketing', { body });
    if (error) {
      let detail = error.message || 'Unbekannter Fehler';
      try { if (error.context?.json) { const j = await error.context.json(); detail = j.error || j.message || detail; } } catch (_) {}
      throw new Error(detail + ' (Edge Function dachwerk-marketing prüfen)');
    }
    if (data?.error) throw new Error(data.error);
    return data;
  }
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function pollResult(taskId) {
    const started = Date.now();
    while (Date.now() - started < 120000) {
      await wait(2500);
      const data = await invokeFunction({ action: 'status', predictionId: taskId });
      const status = String(data.status || '').toLowerCase();
      if (status === 'completed') {
        if (!data.imageUrl || !/^https:\/\//i.test(data.imageUrl)) throw new Error('WaveSpeedAI meldet Erfolg, aber keine Bild-URL.');
        return data.imageUrl;
      }
      if (['failed', 'cancelled', 'timeout', 'deleted'].includes(status)) {
        throw new Error(data.error || `Bildgenerierung ${status}.`);
      }
      if (!['created', 'processing', 'queued', ''].includes(status)) throw new Error(`Unbekannter Aufgabenstatus: ${status}`);
    }
    throw new Error('Die Bildgenerierung dauert zu lange. Bitte in WaveSpeedAI prüfen, bevor du erneut startest, um Doppelkosten zu vermeiden.');
  }
  function addResultCard(result) {
    const card = document.createElement('article'); card.className = 'marketing-result';
    const img = document.createElement('img'); img.src = result.url; img.alt = result.styleLabel + ' – ' + result.formatLabel; img.loading = 'lazy'; img.style.aspectRatio = result.ratio;
    const info = document.createElement('div'); info.className = 'marketing-result-info';
    const title = document.createElement('strong'); title.textContent = result.styleLabel;
    const desc = document.createElement('p'); desc.textContent = result.formatLabel;
    const actions = document.createElement('div'); actions.className = 'marketing-result-actions';
    const open = document.createElement('a'); open.href = result.url; open.target = '_blank'; open.rel = 'noopener noreferrer'; open.textContent = 'Bild öffnen';
    const download = document.createElement('a'); download.href = result.url; download.target = '_blank'; download.rel = 'noopener noreferrer'; download.textContent = 'Herunterladen'; download.setAttribute('download', `dachwerk-${result.styleKey}-${result.formatKey}.jpg`);
    actions.append(open, download); info.append(title, desc, actions); card.append(img, info); $('marketingResults').append(card);
  }
  async function generateAll() {
    if (generating || !sourceDataUrl) return;
    const confirmed = window.confirm('Es werden 4 Bilder erstellt (2 Bildstile × 2 Formate). Jede Generierung kann WaveSpeedAI-Kosten verursachen. Jetzt fortfahren?');
    if (!confirmed) return;
    setBusy(true); $('marketingResults').innerHTML = ''; $('marketingResultsSection').hidden = false;
    const jobs = [
      { styleKey: 'realistisch', formatKey: 'beitrag' },
      { styleKey: 'realistisch', formatKey: 'story' },
      { styleKey: 'werblich', formatKey: 'beitrag' },
      { styleKey: 'werblich', formatKey: 'story' }
    ];
    let done = 0; const errors = [];
    try {
      for (const job of jobs) {
        const style = styles[job.styleKey], format = formats[job.formatKey];
        setProgress(done, jobs.length, `Bild ${done + 1} von ${jobs.length}: ${style.label} · ${format.label} wird gestartet …`);
        try {
          // Submit exactly once; never automatically resubmit a potentially billed task.
          const submitted = await invokeFunction({ action: 'generate', image: sourceDataUrl, style: job.styleKey === 'realistisch' ? 'realistic' : 'advertising', format: job.formatKey === 'beitrag' ? 'feed' : 'story' });
          const taskId = submitted.predictionId;
          if (!taskId) throw new Error('WaveSpeedAI hat keine Aufgaben-ID zurückgegeben. Prüfe die WaveSpeedAI-Historie, bevor du erneut startest.');
          setProgress(done, jobs.length, `Bild ${done + 1} von ${jobs.length}: ${style.label} · ${format.label} wird erzeugt …`);
          const url = await pollResult(taskId);
          addResultCard({ url, styleKey: job.styleKey, formatKey: job.formatKey, styleLabel: style.label, formatLabel: format.label, ratio: format.ratio });
        } catch (e) {
          errors.push(`${style.label} / ${format.label}: ${e.message || e}`);
          const card = document.createElement('article'); card.className = 'marketing-result';
          const status = document.createElement('div'); status.className = 'marketing-result-status'; status.textContent = `${style.label} · ${format.label}: ${e.message || e}`; card.append(status); $('marketingResults').append(card);
        }
        done++;
        setProgress(done, jobs.length, `${done} von ${jobs.length} Bildern bearbeitet.`);
      }
      setStatus(errors.length ? `${jobs.length - errors.length} von 4 Bildern erstellt. Fehlgeschlagene Aufträge bitte prüfen.` : 'Alle vier Bilder sind fertig. Du kannst sie öffnen oder herunterladen.', errors.length > 0);
    } finally {
      setBusy(false);
      $('marketingProgressText').textContent += ' Die Ergebnisse werden nicht in Supabase gespeichert.';
    }
  }
  function resetPhoto() {
    sourceDataUrl = ''; sourceName = ''; $('marketingPhoto').value = ''; $('marketingSourceWrap').hidden = true;
    $('marketingSourcePreview').removeAttribute('src'); $('marketingSourceName').textContent = ''; $('marketingSourceInfo').textContent = '';
    $('marketingGenerate').disabled = true; setStatus('Bitte zuerst ein Foto auswählen.');
  }
  async function handlePhoto(file) {
    if (!file || generating) return;
    setStatus('Foto wird vorbereitet …'); $('marketingGenerate').disabled = true;
    try {
      sourceDataUrl = await compressImage(file); sourceName = file.name;
      $('marketingSourcePreview').src = sourceDataUrl; $('marketingSourceName').textContent = sourceName;
      $('marketingSourceInfo').textContent = `Komprimiert · ${(sourceDataUrl.length * 0.75 / 1024 / 1024).toFixed(2)} MB ungefähr`;
      $('marketingSourceWrap').hidden = false; $('marketingGenerate').disabled = false;
      setStatus('Foto bereit. Beim Start werden vier kostenpflichtige Bildgenerierungen angefordert.');
    } catch (e) { resetPhoto(); setStatus(e.message || 'Foto konnte nicht vorbereitet werden.', true); }
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (!$('marketingPhoto')) return;
    $('marketingPhoto').addEventListener('change', e => handlePhoto(e.target.files?.[0]));
    $('marketingRemovePhoto').addEventListener('click', resetPhoto);
    $('marketingGenerate').addEventListener('click', generateAll);
    $('marketingClearResults').addEventListener('click', () => { $('marketingResults').innerHTML = ''; $('marketingResultsSection').hidden = true; revokeOutputUrls(); });
  });
})();
