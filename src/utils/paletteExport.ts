import { hexToRgb } from './colorUtils';

export interface PaletteColor {
  name: string;
  hex: string;
}

export const exportToACO = (colors: PaletteColor[]): Blob => {
  const buffer = new ArrayBuffer(4 + 2 + colors.length * 10);
  const view = new DataView(buffer);

  view.setUint16(0, 1);
  view.setUint16(2, colors.length);

  let offset = 4;
  colors.forEach(color => {
    const rgb = hexToRgb(color.hex);

    view.setUint16(offset, 0);
    offset += 2;

    view.setUint16(offset, rgb.r * 257);
    offset += 2;
    view.setUint16(offset, rgb.g * 257);
    offset += 2;
    view.setUint16(offset, rgb.b * 257);
    offset += 2;

    view.setUint16(offset, 0);
    offset += 2;
  });

  return new Blob([buffer], { type: 'application/octet-stream' });
};

export const exportToGPL = (colors: PaletteColor[], paletteName: string = 'Palette'): Blob => {
  let gplContent = 'GIMP Palette\n';
  gplContent += `Name: ${paletteName}\n`;
  gplContent += 'Columns: 8\n';
  gplContent += '#\n';

  colors.forEach(color => {
    const rgb = hexToRgb(color.hex);
    const r = rgb.r.toString().padStart(3, ' ');
    const g = rgb.g.toString().padStart(3, ' ');
    const b = rgb.b.toString().padStart(3, ' ');
    gplContent += `${r} ${g} ${b}    ${color.name}\n`;
  });

  return new Blob([gplContent], { type: 'text/plain' });
};

export const exportToCSV = (colors: PaletteColor[]): Blob => {
  let csvContent = 'Name,Hex,R,G,B\n';

  colors.forEach(color => {
    const rgb = hexToRgb(color.hex);
    csvContent += `"${color.name}",${color.hex},${rgb.r},${rgb.g},${rgb.b}\n`;
  });

  return new Blob([csvContent], { type: 'text/csv' });
};

export const exportToJSON = (colors: PaletteColor[], paletteName: string = 'Palette'): Blob => {
  const paletteData = {
    name: paletteName,
    colors: colors.map(color => {
      const rgb = hexToRgb(color.hex);
      return {
        name: color.name,
        hex: color.hex,
        rgb: {
          r: rgb.r,
          g: rgb.g,
          b: rgb.b
        }
      };
    })
  };

  const jsonContent = JSON.stringify(paletteData, null, 2);
  return new Blob([jsonContent], { type: 'application/json' });
};

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export type ExportFormat = 'aco' | 'gpl' | 'csv' | 'json';

export const exportPalette = (
  colors: PaletteColor[],
  format: ExportFormat,
  paletteName: string = 'Palette'
) => {
  let blob: Blob;
  let filename: string;

  switch (format) {
    case 'aco':
      blob = exportToACO(colors);
      filename = `${paletteName}.aco`;
      break;
    case 'gpl':
      blob = exportToGPL(colors, paletteName);
      filename = `${paletteName}.gpl`;
      break;
    case 'csv':
      blob = exportToCSV(colors);
      filename = `${paletteName}.csv`;
      break;
    case 'json':
      blob = exportToJSON(colors, paletteName);
      filename = `${paletteName}.json`;
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  downloadBlob(blob, filename);
};
