import { BlockEditor } from './BlockEditor';
import { Button } from '@workspace/ui/components/button';
import { Save, X } from 'lucide-react';
import { useOfferTemplateBlock } from '@/modules/entities/offer-template-block';
import { useOfferTemplateKonstructor } from '../../..';

export const BlockEditorWidget: React.FC = () => {
    const { saveEditeble } = useOfferTemplateKonstructor();

    const { editeble, deleteEditebleBlock } = useOfferTemplateBlock();

    return (
        <div className="absolute right-0 top-15 w-full md:w-1/4 p-4 bg-background text-foreground">
            <h2 className="text-xl font-bold mb-4">Редактор блока</h2>

            <BlockEditor />
            {editeble && (
                <div className="mt-2 flex gap-2 justify-end">
                    <Button onClick={saveEditeble}>
                        Сохранить
                        <Save />
                    </Button>
                    <Button onClick={deleteEditebleBlock}>
                        Отменить
                        <X />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default BlockEditorWidget;
