import { redirect,  } from "next/navigation";



export default function PortalBitrixPage() {
    redirect('./garant/measures');
    return (
        <div>
            <h1>Portal Garant</h1>
            <p className="text-sm text-gray-500">PGT Entities</p>
            <ul className="list-disc list-inside">
                <li>
                    Регионы портала
                </li>
                <li>
                    Договоры портала
                </li>
                <li>
                    Единицы измерения портала
                </li>
            </ul>
        </div>
    );
}
