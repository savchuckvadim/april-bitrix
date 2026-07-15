'use client';

import { FC } from 'react';
import { AudioPlayer } from '@workspace/ui/components/audio-player';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import { EVCallingRecord } from '../model';
import { eventCallingRecordActions } from '../model/EventCallingRecordSlice';

/** Одна запись звонка: плеер + синхронизация «играет только одна». */
export const RecordItem: FC<{ record: EVCallingRecord }> = ({ record }) => {
    const dispatch = useAppDispatch();

    return (
        <AudioPlayer
            src={record.url}
            title={record.name}
            playing={record.isPlaying}
            onPlayingChange={status =>
                dispatch(
                    eventCallingRecordActions.setPlayingStatus({
                        fileId: record.id,
                        status,
                    }),
                )
            }
        />
    );
};
