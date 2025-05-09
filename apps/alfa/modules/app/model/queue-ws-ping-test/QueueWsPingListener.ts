
import { AppDispatch, AppGetState, AppThunk } from "../store";
import { API_METHOD, backAPI, EBACK_ENDPOINT } from "@workspace/api";



export const socketThunk = (
  userId: number,
  domain: string
): AppThunk =>
  async (dispatch: AppDispatch, getState: AppGetState, { getWSClient }) => {
    const socket = getWSClient()

    const waitForConnection = () =>
      new Promise<void>((resolve) => {
        if (socket.socket.connected) {
          resolve();
        } else {
          socket.socket.once('connect', () => {
            resolve();
          });
        }
      });

    await waitForConnection();


    const socketId = socket.id
    const reqData = {
      userId,
      domain,
      socketId
    }
    console.log('reqData')
    console.log(reqData)
    const response = await backAPI.service(EBACK_ENDPOINT.QUEUE_PING, API_METHOD.POST, reqData)


    console.log('push queue ping http request')
    console.log(response)

    const handler = (data: unknown) => {

      console.log('from test queue ws')
      console.log(data)

      socket.off('queue-ping:done', handler); // отписка// отписка
    };
    socket.on('queue-ping:done', (data: unknown) => {
      console.log(socket)
      console.log('ответ ws по событию queue-ping:done')

      handler(data)
    });

  }

