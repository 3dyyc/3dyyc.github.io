-- 3D Уус: изображения, закреплённые за цветовыми вариантами товара.
-- Безопасно выполнять повторно.
alter table public.products
  add column if not exists color_images jsonb not null default '{}'::jsonb;

comment on column public.products.color_images is
  'JSON map: название цвета -> публичный URL фотографии товара из массива images';
