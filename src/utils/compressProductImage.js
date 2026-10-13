const MAX_DIMENSION = 1920;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const WEBP_QUALITIES = [0.82, 0.72, 0.62, 0.52];

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Could not read image "${file.name}".`));
    };
    image.src = objectUrl;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not optimize the selected product photo."));
        }
      },
      type,
      quality
    );
  });

const compressProductImage = async (file) => {
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" is not a supported image.`);
  }

  const image = await loadImage(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  if (longestSide <= MAX_DIMENSION && file.size <= MAX_FILE_SIZE) {
    return file;
  }

  let scale = Math.min(1, MAX_DIMENSION / longestSide);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Your browser could not prepare this product photo.");
  }

  let blob;
  while (scale >= 0.5) {
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of WEBP_QUALITIES) {
      blob = await canvasToBlob(canvas, "image/webp", quality);
      if (blob.type !== "image/webp") {
        context.fillStyle = "#ffffff";
        context.globalCompositeOperation = "destination-over";
        context.fillRect(0, 0, canvas.width, canvas.height);
        blob = await canvasToBlob(canvas, "image/jpeg", quality);
        context.globalCompositeOperation = "source-over";
      }
      if (blob.size <= MAX_FILE_SIZE) break;
    }

    if (blob.size <= MAX_FILE_SIZE) break;
    scale *= 0.8;
  }

  if (!blob || blob.size > MAX_FILE_SIZE) {
    throw new Error(`Could not reduce "${file.name}" below 2 MB. Please choose a smaller photo.`);
  }

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${name}.${extension}`, {
    type: blob.type,
    lastModified: file.lastModified,
  });
};

export default compressProductImage;
