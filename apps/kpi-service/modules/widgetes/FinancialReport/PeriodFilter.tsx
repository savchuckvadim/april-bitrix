// import React from 'react';
// import { PeriodFilter } from '../model/types';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
// import { Checkbox } from '@workspace/ui/components/checkbox';
// import { Button } from '@workspace/ui/components/button';

// interface PeriodFilterProps {
//     filter: PeriodFilter;
//     onFilterChange: (filter: Partial<PeriodFilter>) => void;
//     availableYears: number[];
//     availableUsers: Array<{ id: string; name: string }>;
// }

// export const PeriodFilterComponent: React.FC<PeriodFilterProps> = ({
//     filter,
//     onFilterChange,
//     availableYears,
//     availableUsers
// }) => {
//     const currentYear = new Date().getFullYear();
//     const maxYear = Math.max(...availableYears, currentYear + 2);

//     const handleStartYearChange = (year: string) => {
//         const startDate = new Date(+year, 0, 1).toISOString();
//         const endDate = new Date(filter.endDate);

//         // Если новая начальная дата после конечной, обновляем конечную
//         if (new Date(startDate) > endDate) {
//             const newEndDate = new Date(+year, 11, 31).toISOString();
//             onFilterChange({
//                 startDate,
//                 endDate: newEndDate
//             });
//         } else {
//             onFilterChange({ startDate });
//         }
//     };

//     const handleEndYearChange = (year: string) => {
//         const endDate = new Date(+year, 11, 31).toISOString();
//         const startDate = new Date(filter.startDate);

//         // Если новая конечная дата до начальной, обновляем начальную
//         if (new Date(endDate) < startDate) {
//             const newStartDate = new Date(+year, 0, 1).toISOString();
//             onFilterChange({
//                 startDate: newStartDate,
//                 endDate
//             });
//         } else {
//             onFilterChange({ endDate });
//         }
//     };

//     const handleUserToggle = (userId: string) => {
//         const currentUsers = filter.assignedUsers;
//         const newUsers = currentUsers.includes(userId)
//             ? currentUsers.filter(id => id !== userId)
//             : [...currentUsers, userId];
//         onFilterChange({ assignedUsers: newUsers });
//     };

//     const handleSelectAllUsers = () => {
//         onFilterChange({ assignedUsers: availableUsers.map(user => user.id) });
//     };

//     const handleDeselectAllUsers = () => {
//         onFilterChange({ assignedUsers: [] });
//     };

//     return (
//         <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
//             <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">Период с:</label>
//                 <Select
//                     value={new Date(filter.startDate).getFullYear().toString()}
//                     onValueChange={handleStartYearChange}
//                 >
//                     <SelectTrigger className="w-24">
//                         <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {availableYears.map(year => (
//                             <SelectItem key={year} value={year.toString()}>
//                                 {year}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">по:</label>
//                 <Select
//                     value={new Date(filter.endDate).getFullYear().toString()}
//                     onValueChange={handleEndYearChange}
//                 >
//                     <SelectTrigger className="w-24">
//                         <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                         {Array.from({ length: maxYear - new Date(filter.startDate).getFullYear() + 1 }, (_, i) => {
//                             const year = new Date(filter.startDate).getFullYear() + i;
//                             return (
//                                 <SelectItem key={year} value={year.toString()}>
//                                     {year}
//                                 </SelectItem>
//                             );
//                         })}
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">Клиенты:</label>
//                 <Select
//                     value={filter.clientStatus}
//                     onValueChange={(value: 'all' | 'active' | 'inactive') =>
//                         onFilterChange({ clientStatus: value })
//                     }
//                 >
//                     <SelectTrigger className="w-32">
//                         <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="all">Все</SelectItem>
//                         <SelectItem value="active">Активные</SelectItem>
//                         <SelectItem value="inactive">Неактивные</SelectItem>
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">Индексация:</label>
//                 <Select
//                     value={filter.indexStatus}
//                     onValueChange={(value: 'all' | 'growing' | 'declining' | 'stable') =>
//                         onFilterChange({ indexStatus: value })
//                     }
//                 >
//                     <SelectTrigger className="w-32">
//                         <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                         <SelectItem value="all">Все</SelectItem>
//                         <SelectItem value="growing">Растущие</SelectItem>
//                         <SelectItem value="declining">Падающие</SelectItem>
//                         <SelectItem value="stable">Стабильные</SelectItem>
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">Пользователи:</label>
//                 <div className="flex items-center gap-2">
//                     <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={handleSelectAllUsers}
//                         className="text-xs"
//                     >
//                         Все
//                     </Button>
//                     <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={handleDeselectAllUsers}
//                         className="text-xs"
//                     >
//                         Никто
//                     </Button>
//                 </div>
//                 <div className="max-h-32 overflow-y-auto border rounded p-2 bg-white">
//                     {availableUsers.map(user => (
//                         <div key={user.id} className="flex items-center space-x-2">
//                             <Checkbox
//                                 id={`user-${user.id}`}
//                                 checked={filter.assignedUsers.includes(user.id)}
//                                 onCheckedChange={() => handleUserToggle(user.id)}
//                             />
//                             <label
//                                 htmlFor={`user-${user.id}`}
//                                 className="text-sm cursor-pointer"
//                             >
//                                 {user.name}
//                             </label>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };
