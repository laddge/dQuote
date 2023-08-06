import fs from 'fs';
import satori, { Font } from 'satori';
import twemoji, { Twemoji } from '@twemoji/api';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const parseReturn = (text: string) => {
  const children = [];
  for (const line of text.split('\n')) {
    children.push(line);
    children.push({
      type: 'div',
      props: {
        style: {
          width: '100%',
        },
      },
    });
  }
  return children;
}

const fonts: Font[] = [
  {
    name: 'NotoSansJP',
    data: fs.readFileSync('./assets/NotoSansJP-Regular.otf'),
    weight: 400,
    style: 'normal',
  },
  {
    name: 'NotoSansJP',
    data: fs.readFileSync('./assets/NotoSansJP-Bold.otf'),
    weight: 700,
    style: 'normal',
  },
  {
    name: 'NotoSansMath',
    data: fs.readFileSync('./assets/NotoSansMath-Regular.ttf'),
    weight: 400,
    style: 'normal',
  },
]

export const generate = async (
  userName: string,
  userDisplayName: string,
  avatarURL: string,
  content: string,
) => {
  const res = await fetch(avatarURL);
  const avatar = (await sharp(Buffer.from(await res.arrayBuffer())).grayscale().toBuffer()).toString('base64');
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: '100%',
          height: '100%',
          background: `url(data:image/png;base64,${avatar})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: '630px 630px',
          backgroundPosition: 'left',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(to right, transparent, transparent 23%, #000 45%)',
                justifyContent: 'flex-end',
                alignItems: 'center',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      width: '55%',
                      height: '100%',
                      padding: '32px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      wordBreak: 'break-word',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            flexGrow: 1,
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#fff',
                            fontSize: '48px',
                            fontWeight: 700,
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  width: '100%',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  color: '#fff',
                                  fontSize: '48px',
                                  fontWeight: 700,
                                },
                                children: parseReturn(content),
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#fff',
                            fontSize: '36px',
                            transform: 'skewX(-10deg)',
                            marginTop: '32px',
                          },
                          children: '- ' + userDisplayName,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#ccc',
                            fontSize: '32px',
                            marginBottom: '32px',
                          },
                          children: '@' + userName,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts,
      loadAdditionalAsset: async (code, text) => {
        if (code === 'emoji') {
          const _twemoji = twemoji as Twemoji;
          const src = _twemoji.parse(text, { folder: 'svg', ext: '.svg' }).match(/src=\"(.+)\"/);
          if (src) {
            const res = await fetch(src[1]);
            const svg = await res.text();
            return 'data:image/svg+xml;base64,' + btoa(svg);
          }
        }
        return '';
      },
    },
  );
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}
