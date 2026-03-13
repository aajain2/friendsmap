export const NODE_COLORS = [
  '#D3C2CD', // Lilac Grey
  '#849E15', // Spring Leaves
  '#92A2A6', // Good Surf
  '#B28622', // Gold Velvet
  '#F8CABA', // Brink of Pink
  '#D8560E', // Poppy
  '#EFCE7B', // Butter Yellow
  '#E1903E', // Florida Oranges
  '#6777B6', // Pea Flower
  '#2B2B23', // Night Forest
  '#D17089', // Dusty Berry
  '#CBD183', // Pistachio
];

export function getRandomColor(): string {
  return NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)];
}
