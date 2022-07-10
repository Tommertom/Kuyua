


//
// resizing a file from a HTML-input into a newly dimensioned blob
//
export const resizeFile = (file, maxDimensions, callback) => {

  const maxWidth = maxDimensions.width;
  const maxHeight = maxDimensions.height;

  if (!file.type.match(/image.*/)) {
    callback(file, false);
    return false;
  }

  if (file.type.match(/image\/gif/)) {
    // Not attempting, could be an animated gif
    callback(file, false);
    // TODO: use https://github.com/antimatter15/whammy to convert gif to webm
    return false;
  }

  const image = document.createElement('img');

  image.onload = (imgEvt) => {

    console.log('Image onload event', imgEvt);
    let width = image.width;
    let height = image.height;
    let isTooLarge = false;

    if (width >= height && width > maxDimensions.width) {
      // width is the largest dimension, and it's too big.
      height *= maxDimensions.width / width;
      width = maxDimensions.width;
      isTooLarge = true;
    } else if (height > maxDimensions.height) {
      // either width wasn't over-size or height is the largest dimension
      // and the height is over-size
      width *= maxDimensions.height / height;
      height = maxDimensions.height;
      isTooLarge = true;
    }

    if (!isTooLarge) {
      // early exit; no need to resize
      callback(file, false);
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, width, height);

    // TODO: remove canvas and image?
    canvas.toBlob((blob) => {
      callback(blob, true);
    }, file.type);
  };

  const reader = new FileReader();
  reader.onload = (evt) => {
    console.log('Image reader event', evt);
    image.src = evt.target.result as string;
  };
  reader.readAsDataURL(file);
};

export const arrayToCSV = (listOfStuff: any[], delimiter: string) => {

  if (listOfStuff.length === 0) {
    return '';
  }

  let headerLine = [];
  Object.keys(listOfStuff[0]).forEach(key => {
    headerLine = [...headerLine, key];
  });

  let exportedLines = [headerLine];
  listOfStuff.forEach(confirmCode => {
    let contentLine = [];
    headerLine.forEach(contentKey => {
      contentLine = [...contentLine, confirmCode[contentKey]];
    });
    exportedLines = [...exportedLines, contentLine];
  });

  let exportedText = '';
  exportedLines.map(line => {
    line.map(col => {
      exportedText = exportedText + delimiter + col;
    });
    exportedText = exportedText + '\n';
  });

  return exportedText;
};

export const downloadInput = (input: any, mimeType: string, fileName: string) => {

  const blob = new Blob([input], { type: mimeType });

  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (e) {
    console.error('downloadText error', e);
  }
};




