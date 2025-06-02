"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Input } from "@workspace/ui/components/input";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";

export function DocumentSettingsForm() {
  const [supplier, setSupplier] = useState("Апрель");
  const [companyName, setCompanyName] = useState("TEST");
  const [inn, setInn] = useState("");
  const [position, setPosition] = useState("");
  const [fio, setFio] = useState("");
  const [makeWord, setMakeWord] = useState(false);

  return (
    <div className="space-y-4 p-4">
      <div>
        <label htmlFor="supplier" className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Поставщик
        </label>
        <Select value={supplier} onValueChange={setSupplier}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Выберите поставщика" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Апрель">Апрель</SelectItem>
            <SelectItem value="Май">Май</SelectItem>
            {/* Добавьте другие варианты */}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Название Компании
        </label>
        <Input type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
      </div>

      <div>
        <label htmlFor="inn" className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          ИНН
        </label>
        <Input type="text" id="inn" value={inn} onChange={(e) => setInn(e.target.value)} />
      </div>

      <div>
        <label htmlFor="position" className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Должность
        </label>
        <Input type="text" id="position" value={position} onChange={(e) => setPosition(e.target.value)} />
      </div>

      <div>
        <label htmlFor="fio" className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          ФИО
        </label>
        <Input type="text" id="fio" value={fio} onChange={(e) => setFio(e.target.value)} />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="make-word" checked={makeWord} onCheckedChange={(checked) => setMakeWord(checked === "indeterminate" ? false : checked)} />
        <label
          htmlFor="make-word"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Сделать Word
        </label>
      </div>

      <Button variant="default">Документ</Button>

      <Button variant="secondary">Создать (Избранное)</Button>
    </div>
  );
}
