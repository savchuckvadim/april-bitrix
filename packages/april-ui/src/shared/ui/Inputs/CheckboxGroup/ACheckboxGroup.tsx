
type options<I> = I[]

interface ACheckboxGroupProps<T, I> {
    label?: string;
    options: options<I>;
    currentValue: options<I>; // массив отмеченных
    nameForHandler: T;
    handleChange: (type: T, id: number) => void;
}
const ACheckboxGroup = <T extends string | number, I extends { id: number, title: string; code: string }>({
    label,
    options,
    currentValue,
    nameForHandler,
    handleChange,
}: ACheckboxGroupProps<T, I>) => {
    const toggleValue = (id: number) => {

        handleChange(nameForHandler, id);
    };

    return (
        <div

            className="mb-3 p-0 d-flex flex-column justify-content-start align-items-start flex-wrap">
            {label && <label className="form-label d-block">{label}</label>}
            {options.map(opt => (
                <div key={opt.code}
                    className="form-check form-check-inline"
                    style={{
                        'cursor': 'pointer'
                    }}
                >
                    <input
                        style={{
                            'cursor': 'pointer'
                        }}

                        className="form-check-input"
                        type="checkbox"
                        id={`check-${opt.code}`}
                        value={opt.code}
                        checked={currentValue.some(v => v.id === opt.id)}
                        onChange={() => toggleValue(opt.id)}
                    />
                    <label
                        style={{
                            'cursor': 'pointer'
                        }}
                        className="form-check-label" htmlFor={`check-${opt.code}`}>
                        {opt.title}
                    </label>
                </div>
            ))}
        </div>
    );
};
export default ACheckboxGroup;