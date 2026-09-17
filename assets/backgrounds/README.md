# Alpine lake background

AI-generated with the built-in image generation tool on 2026-09-08; not a photograph of a verified geographic location.

Prompt: Create one photorealistic landscape photograph for a full-screen website background, wide 16:9 composition. Quiet alpine lake with layered distant mountains, soft morning haze and a few dark pine trees at the far edges. Natural restrained stone gray, muted lake blue, subtle earthy tones, no strong green cast or saturated colors. Gentle diffused daylight, medium brightness, fine photographic texture, peaceful premium desktop wallpaper feeling. Broad calm areas of water and sky behind the center for a dashboard overlay. Landscape must remain beautiful when dimmed by a translucent neutral veil. No text, no logo, no people, no buildings, no interface. Save a high-resolution landscape image.

Asset: `alpine-lake.png`. It is retained as the original source. The live interface
uses responsive WebP derivatives so the decorative background does not delay the
dashboard:

- `alpine-lake-1600.webp` for desktop
- `alpine-lake-900.webp` for mobile

The interface blends the image with a neutral gray fallback at 55% opacity.
Reading cards remain white. Users can choose a solid color or a local image,
adjust its position and opacity, and restore the default. Custom images are
compressed in the browser and saved only in that browser's IndexedDB.
