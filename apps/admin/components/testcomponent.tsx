'use client';
import { Button } from '@workspace/ui/components/button';
import { test } from './test.util';


export default function TestComponent() {
    const handleClick = async () => {
        console.log('Button clicked');
        const result = await test();
        console.log(result);

    };
    return <Button size="sm" onClick={handleClick}>Button</Button>;
}
