import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { requestObj } from '../config';
import { getWebsocketUrl } from '../utils';

interface AiToolProps {
  isText?: boolean;
  respondHoodle: (result: string) => void;
  loadHoodle?: (isLoading: boolean) => void;
  errorHoodle?: (hasError: boolean) => void;
}

interface CropperRef {
  submitHoodle: (v: string) => void;
}

const AiTool = forwardRef<CropperRef, AiToolProps>(function AiTool(
  { isText, respondHoodle, loadHoodle, errorHoodle },
  ref
) {
  const [historyMessage, setHistoryMessage] = useState<any[]>([
    { role: 'user', content: '你是谁' },
    { role: 'assistant', content: '我是AI助手' }
  ]);

  useImperativeHandle(ref, () => ({
    submitHoodle: sendMsg
  }));

  const sendMsg = async (questionText: string) => {
    let fullResponse = '';
    if (loadHoodle) loadHoodle(true);

    try {
      const myUrl = await getWebsocketUrl();
      const socket = new WebSocket(myUrl);

      socket.addEventListener('open', (event) => {
        const params = {
          header: {
            app_id: requestObj.APPID,
            uid: 'wzz'
          },
          parameter: {
            chat: {
              domain: 'general',
              temperature: 0.5,
              max_tokens: 1024
            }
          },
          payload: {
            message: {
              text: [
                ...historyMessage,
                { role: 'user', content: questionText }
              ]
            }
          }
        };
        socket.send(JSON.stringify(params));
      });

      socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (!data.payload) {
          socket.close();
          return;
        }
        fullResponse += data.payload.choices.text[0].content;
        if (data.header.code !== 0) {
          console.log('出错了', data.header.code, ':', data.header.message);
          socket.close();
        }
        if (data.header.code === 0 && data.payload.choices.text && data.header.status === 2) {
          respondHoodle(fullResponse); // Send the full response only when it's complete
          setTimeout(() => {
            socket.close();
          }, 1000);
        }
      });

      socket.addEventListener('close', (event) => {
        setHistoryMessage([
          ...historyMessage,
          { role: 'user', content: questionText },
          { role: 'assistant', content: fullResponse }
        ]);
        if (loadHoodle) loadHoodle(false);
      });

      socket.addEventListener('error', (event) => {
        if (errorHoodle) errorHoodle(true);
        console.log('连接发送错误！！', event);
      });
    } catch (error) {
      console.error('Error in sendMsg:', error);
      if (errorHoodle) errorHoodle(true);
      if (loadHoodle) loadHoodle(false);
    }
  };

  return null;
});

export default AiTool;