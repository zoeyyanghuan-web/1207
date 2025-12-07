import { Color } from 'three';

// Visual Configuration
export const COLORS = {
  // Vibrant, Lush Green
  EMERALD: new Color('#005C35'), 
  EMERALD_LIGHT: new Color('#2D8A55'),
  // Magical Warm Gold
  GOLD: new Color('#FFC800'), 
  GOLD_ROSE: new Color('#FFB7C5'),
  RED_VELVET: new Color('#D90429'), // Brighter red
  SILVER: new Color('#E0E7FF'),
  // New Colors
  GIFT_RED: new Color('#FF0A54'),
  GIFT_GREEN: new Color('#38B000'),
  GIFT_BLUE: new Color('#4361EE'),
  CANDY_STRIPE: new Color('#FF477E'),
  CANDY_WHITE: new Color('#FFFFFF'),
  SNOW: new Color('#F0F8FF'),
  // Environment
  MAGIC_SKY: new Color('#1A0B2E'), // Deep magical purple
  MAGIC_FOG: new Color('#240E3E'),
};

// Tree Dimensions
export const TREE_CONFIG = {
  HEIGHT: 14,
  RADIUS_BASE: 5.5,
  PARTICLE_COUNT: 18000, // More particles for fuller look
  ORNAMENT_COUNT: 700, 
  CHAOS_RADIUS: 35, 
};

// Animation
export const ANIMATION_SPEED = 1.8;