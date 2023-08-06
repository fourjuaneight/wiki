const worker = new Worker('/noise.ww.min.js');

const fragment = document.createDocumentFragment();
const size: number = 64;

const makeNoise = async (data: Uint8ClampedArray) => {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(new ImageData(data, size, size), 0, 0);

  const png: Blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/png', 0.8),
  );
  const url = URL.createObjectURL(png);
  const div = document.createElement('div');

  div.classList.add(
    'noise',
    'duration-1000',
    'ease-in-out',
    'transition-opacity',
  );
  div.style = `background-image: url(${url})`;
  fragment.appendChild(div);
  document.body.appendChild(fragment);
};

if (window.Worker) {
  worker.postMessage(size);

  worker.onmessage = (evt: MessageEvent<Uint8ClampedArray>) => {
    makeNoise(evt.data);
  };
}
