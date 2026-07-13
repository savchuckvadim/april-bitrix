import React from 'react'
import { PBXContactStateItem } from '../../../../type/pbx-contact-type'
import { ALabel, ATogglerColor } from '@workspace/april-ui'

export default function PbxFields({ contact }: { contact: PBXContactStateItem }) {
    return (
        <div className='d-flex flex-column justify-content-start'
            style={{
                'width': '50%',
                'height': '100%'
            }}
        >
            {contact.fields.map(pbxField => {
                const currentOrder = pbxField.field.items.findIndex(item => item.bitrixId === (pbxField.current as string | number))

                return <div className='mb-2'>
                    <ALabel
                        htmlId={pbxField.field.code}
                        label={pbxField.field.name}
                    />
                    <div id={pbxField.field.code}>
                        <ATogglerColor

                            palit={[
                                'april',
                                'warning',
                                'success',
                                'dblue',
                                'orange',
                                'green',
                                'fiolet',
                                'dark',
                            ]}
                            innerValue={pbxField.field.name}
                            key={pbxField.field.code}
                            title={pbxField.field.name}
                            total={pbxField.field.items.length}
                            order={currentOrder}
                            onClick={() => { }}
                        />
                    </div>

                </div>
            })}

        </div>
    )
}
