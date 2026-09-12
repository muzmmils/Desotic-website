/**
 * Dish + ingredient imagery. Swap any constant below for real photography
 * (imported asset or URL) — every consumer reads a single string.
 */
import saladImage from "@/assets/dish-salad.jpg";
import juiceImage from "@/assets/dish-juice.jpg";
import oatmealImage from "@/assets/dish-oatmeal.jpg";

import olive from "@/assets/ing-olive.png";
import tomato from "@/assets/ing-tomato.png";
import carrotJulienne from "@/assets/ing-carrot-julienne.png";
import lettuce from "@/assets/ing-lettuce.png";
import sesame from "@/assets/ing-sesame.png";
import pomegranate from "@/assets/ing-pomegranate.png";
import apple from "@/assets/ing-apple.png";
import beetroot from "@/assets/ing-beetroot.png";
import carrot from "@/assets/ing-carrot.png";
import nuts from "@/assets/ing-nuts.png";
import chocolate from "@/assets/ing-chocolate.png";
import seeds from "@/assets/ing-seeds.png";
import barley from "@/assets/ing-barley.png";

export const SALAD_IMAGE = saladImage;
export const JUICE_IMAGE = juiceImage;
export const OATMEAL_IMAGE = oatmealImage;

export const INGREDIENTS = {
  olive,
  tomato,
  carrotJulienne,
  lettuce,
  sesame,
  pomegranate,
  apple,
  beetroot,
  carrot,
  nuts,
  chocolate,
  seeds,
  barley,
} as const;
