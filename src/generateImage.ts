import fs from 'fs';
import satori, { Font } from 'satori';
import twemoji, { Twemoji } from '@twemoji/api';
import sharp from 'sharp';

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

type ImageCache = {
  [key: string]: {
    color: string,
    grayscale: string,
  },
}

const cache: ImageCache = {};

export const generate = async (
  userName: string,
  userDisplayName: string,
  avatarURL: string,
  content: string,
  light?: boolean,
) => {
  let avatar: string;
  if (!cache[avatarURL]) {
    cache[avatarURL] = {
      color: '',
      grayscale: '',
    };
  }
  if (light) {
    if (cache[avatarURL].color) {
      avatar = cache[avatarURL].color;
    } else {
      const res = await fetch(avatarURL);
      const img = sharp(Buffer.from(await res.arrayBuffer()));
      avatar = (await img.toBuffer()).toString('base64');
      cache[avatarURL].color = avatar;
    }
  } else {
    if (cache[avatarURL].grayscale) {
      avatar = cache[avatarURL].grayscale;
    } else {
      const res = await fetch(avatarURL);
      const img = sharp(Buffer.from(await res.arrayBuffer()));
      cache[avatarURL].color = (await img.toBuffer()).toString('base64');
      avatar = (await img.grayscale().toBuffer()).toString('base64');
      cache[avatarURL].grayscale = avatar;
    }
  }
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: light ? '#fff' : '#000',
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
                background: `linear-gradient(to right, transparent, transparent 23%, ${light ? '#fff' : '#000'} 45%)`,
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
                                  color: light ? '#000' : '#fff',
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
                            color: light ? '#000' : '#fff',
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
                            color: light ? '#333' : '#ccc',
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
          const src = _twemoji.parse(text).match(/src=\"(.+)\"/);
          if (src) {
            if (!cache[src[1]]) {
              cache[src[1]] = { color: '', grayscale: '' };
            }
            if (!cache[src[1]].color) {
              const res = await fetch(src[1]);
              const img = await res.arrayBuffer();
              cache[src[1]].color = Buffer.from(img).toString('base64');
            }
            return 'data:image/png;base64,' + cache[src[1]].color;
          }
        }
        return '';
      },
    },
  );
  return sharp(Buffer.from(svg)).png().toBuffer();
}
