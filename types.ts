/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface HeroDraft {
  id: number;
  tag: string;
  slogan: string;
  subtext: string;
  bgImage: string;
  description: string;
  visible?: boolean;
  defaultTag?: string;
  defaultSlogan?: string;
  defaultSubtext?: string;
  defaultBgImage?: string;
  defaultDescription?: string;
}

export interface Song {
  id: number | string;
  title: string;
  genre: string;
  mood: string;
  description: string;
  vocalUrl?: string;
  coverUrl?: string;
  videoUrl?: string;
}