const HEX_TO_LETTER = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R'];

export const shortenId = (value = '', length = 8) => {
  if (!value) return '';
  const str = String(value).replace(/[^0-9a-z]/gi, '');
  if (str.length <= length) {
    return str.toUpperCase();
  }
  const head = str.slice(0, Math.floor(length / 2));
  const tail = str.slice(-Math.ceil(length / 2));
  return `${head}${tail}`.toUpperCase();
};

export const formatDoctorId = (value, length = 8) => {
  if (!value) return '';
  const hex = String(value).replace(/[^0-9a-f]/gi, '').toLowerCase();
  if (!hex) return shortenId(value, length);
  const sliced = hex.slice(-length);
  let result = '';
  for (const char of sliced) {
    const index = parseInt(char, 16);
    result += HEX_TO_LETTER[index] || 'X';
  }
  return `DR-${result.toUpperCase()}`;
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch (err) {
    return new Date(date).toLocaleString();
  }
};
