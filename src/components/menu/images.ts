/**
 * Mapa de imagens de banner por categoria do cardápio.
 * Chave: id da categoria (conforme menuData.json)
 * Valor: imagem importada do módulo de assets
 */

import bagueteImage from "@/assets/baguete.jpg";
import bannerArtesanais from "@/assets/Banner Hamburgues Artesanais.png";
import bannerChurrascoEPorcoes from "@/assets/Banner Churrasco e Porções.png";
import bannerPizzasDoces from "@/assets/Banner Pizzas Doces.png";
import bannerPizzasSalgadas from "@/assets/Banner Pizzas Salgadas.png";
import bannerTradicionais from "@/assets/Banner Hamburgues Tradicionais.png";
import bannerDrinks from "@/assets/Banner Drinks.png";
import bannerPratoFeito from "@/assets/Banner Prato Feito.png";
import bannerRefeicoes from "@/assets/Banner Refeições.png";
import bannerSobremesas from "@/assets/Banner Sobremesas.png";
import bannerPicanha from "@/assets/Banner Picanha.png";
import bebidasImage from "@/assets/bebidas.jpg";
import artesanaisImage from "@/assets/artesanais.jpg";

export const images: Record<string, string> = {
  tradicionais: bannerTradicionais,
  artesanais: bannerArtesanais,
  pizzas: bannerPizzasSalgadas,
  "pizzas-doces": bannerPizzasDoces,
  drinks: bannerDrinks,
  sobremesas: bannerSobremesas,
  "prato-feito": bannerPratoFeito,
  churrasco: bannerChurrascoEPorcoes,
  // chapas e porcoes usam o banner de churrasco e porções (visual mais próximo)
  chapas: bannerChurrascoEPorcoes,
  porcoes: bannerChurrascoEPorcoes,
  refeicoes: bannerRefeicoes,
  baguete: bagueteImage,
  "picanha-na-pedra": bannerPicanha,
  bebidas: bebidasImage,
};

/** Foto de banner da categoria (com imagem padrão). */
export const categoryImage = (categoryId: string) => images[categoryId] ?? artesanaisImage;

/** Foto do produto: imagem própria, senão a da categoria. */
export const itemImage = (item: { imageUrl?: string | null }, categoryId: string) =>
  item.imageUrl || categoryImage(categoryId);
