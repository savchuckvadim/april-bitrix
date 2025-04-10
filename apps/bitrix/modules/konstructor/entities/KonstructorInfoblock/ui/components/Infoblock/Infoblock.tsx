import React, { FC, useState } from 'react';

import { AIBlock } from '@/modules/konstructor/entities/KonstructorInfoblock/type/document-infoblock-type';
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Form, FormControl } from '@workspace/ui/components/form'


interface IBlockProps {
  iblock: AIBlock
}

export const Infoblock: FC<IBlockProps> = ({
  iblock
}) => {
  // const [text, setText] = useState(iblock.description); // Начальное значение текста
  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setText(event.target.value); // Обновление текста при изменении ввода
  // };
  //@ts-ignore
  return <Form
  // className="col-md-12"
  // style={{ cursor: 'pointer' }}
  // onClick={() => setIsWord(!isActive)}
  >
    <FormControl>
      <Label className="col-md-12 mb-0 d-flex align-items-center justify-content-start">
        <Input
          type="checkbox"
          id="flexCheckDefault"
          className={`mb-1 me-1 ${iblock.checked
            ? 'word__checkbox__active'
            : 'word__checkbox'} `

          }
          color="primary"
          // style={{ lineHeight: 0 }}
          value={1}
          checked={iblock.checked}
          key={iblock.id}
        // onChange={(e) => {
        //     setIsWord()
        //     // console.log('word click', e.target.checked)

        // }}
        />
        <p className="mb-1 ml-3">{iblock.name}</p>

      </Label>
    </FormControl>
  </Form>;
}
