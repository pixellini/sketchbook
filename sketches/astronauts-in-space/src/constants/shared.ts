/**
 * These are generic constants that can be used throughout the sketch,
 * and are not tightly coupled to any specific sprite or animation.
 */

export const COLORS = {
    TRANSPARENT: '#00000000',
    WHITE: '#ffffffff', 
    YELLOW: '#fcf1a9ff', 
    BLUE: '#98c0f9ff', 
    DARK_BLUE: '#0b3c91ff',
    ORANGE: '#f9acacff', 
    PINK: '#e299e6ff', 
    DARK_RED: '#ff5656ff', 
    GREEN: '#a6e699ff',
    // Background gradient colours
    SPACE_DARK: '#0a081c',
    SPACE_GRADIENT_CENTER: '#0a1028ff',
    SPACE_GRADIENT_MID: '#0f0c29ff',
    SPACE_GRADIENT_EDGE: '#06050dff',
} as const

export const SPACE_STATIONS = {
    ISS: 'ISS',
    TIANGONG: 'Tiangong'
} as const