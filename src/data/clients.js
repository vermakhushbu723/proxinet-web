// Client logos — taken from proxinet.in/clients ("Our prestigious clients").
const logos = import.meta.glob('../assets/clients/*', { eager: true, import: 'default' });
const logo = (n) => logos[`../assets/clients/client-${String(n).padStart(2, '0')}.${n === 4 ? 'png' : 'jpg'}`];

export const clients = [
  { name: 'Tata Advanced Systems', sector: 'Manufacturing', logo: logo(1) },
  { name: 'Fiem Industries', sector: 'Manufacturing', logo: logo(2) },
  { name: 'L&L Partners', sector: 'Legal', logo: logo(3) },
  { name: 'State Bank of India', sector: 'BFSI', logo: logo(4) },
  { name: 'Sanden', sector: 'Manufacturing', logo: logo(5) },
  { name: 'Ricoh', sector: 'Technology', logo: logo(6) },
  { name: 'Loesche', sector: 'Manufacturing', logo: logo(7) },
  { name: 'Bira 91', sector: 'Food & Beverage', logo: logo(8) },
  { name: 'LU-VE Group', sector: 'Manufacturing', logo: logo(9) },
  { name: 'Lakshmikumaran & Sridharan', sector: 'Legal', logo: logo(10) },
  { name: 'Sunrise', sector: 'Manufacturing', logo: logo(11) },
  { name: 'Remfry & Sagar', sector: 'Legal', logo: logo(12) },
  { name: 'DEN Networks', sector: 'Media', logo: logo(13) },
  { name: 'Agriculture Insurance Company of India', sector: 'BFSI', logo: logo(14) },
  { name: 'Star Paper Mills', sector: 'Manufacturing', logo: logo(15) },
  { name: 'Institut Français', sector: 'Education', logo: logo(16) },
  { name: 'India TV', sector: 'Media', logo: logo(17) },
  { name: 'Shardul Amarchand Mangaldas', sector: 'Legal', logo: logo(18) },
  { name: 'Metal One', sector: 'Trading', logo: logo(19) },
  { name: 'Methodex', sector: 'Technology', logo: logo(20) },
  { name: 'RNA Technology and IP Attorneys', sector: 'Legal', logo: logo(21) },
  { name: 'Kyodo Yushi', sector: 'Manufacturing', logo: logo(22) },
  { name: 'Maharaja Whiteline', sector: 'Manufacturing', logo: logo(23) },
  { name: 'KDDI', sector: 'Technology', logo: logo(24) },
  { name: 'NDTV India', sector: 'Media', logo: logo(25) },
  { name: 'Tirupati Sugars', sector: 'Manufacturing', logo: logo(26) },
  { name: 'ACPL Exports', sector: 'Manufacturing', logo: logo(27) },
  { name: 'Atul', sector: 'Manufacturing', logo: logo(28) },
  { name: 'CHW Forge', sector: 'Manufacturing', logo: logo(29) },
  { name: 'nThrive', sector: 'Healthcare', logo: logo(30) },
  { name: 'HelpAge India', sector: 'Non-profit', logo: logo(31) },
  { name: 'Mohani Tea', sector: 'Food & Beverage', logo: logo(32) },
  { name: 'Pataka Tea', sector: 'Food & Beverage', logo: logo(33) },
  { name: 'Dana Graziano', sector: 'Manufacturing', logo: logo(34) },
  { name: 'Navori Labs', sector: 'Technology', logo: logo(35) },
  { name: 'Air Liquide', sector: 'Manufacturing', logo: logo(36) },
];

/** Sectors in order of how many clients they have. */
export const clientSectors = Object.entries(
  clients.reduce((acc, c) => ({ ...acc, [c.sector]: (acc[c.sector] || 0) + 1 }), {}),
).sort((a, b) => b[1] - a[1]).map(([s]) => s);
