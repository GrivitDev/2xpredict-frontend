'use client';

import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export function AdInstructionsBuilder({
  value,
  onChange,
}: Props) {
  const [input, setInput] = useState('');

  function addInstruction() {
    const text = input.trim();

    if (!text) {
      return;
    }

    onChange([
      ...value,
      text,
    ]);

    setInput('');
  }

  function removeInstruction(index: number) {
    onChange(
      value.filter((_, i) => i !== index),
    );
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addInstruction();
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">
            Instructions
          </Label>

          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Add instructions shown with the advertisement.
          </p>
        </div>

        {value.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {value.length}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Add instruction"
          className="h-9 text-sm"
        />

        <Button
          type="button"
          size="sm"
          onClick={addInstruction}
          className="h-9 px-3"
        >
          Add
        </Button>
      </div>

      {value.length > 0 && (
        <div className="space-y-1.5">
          {value.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="
                flex
                items-center
                gap-3
                rounded-lg
                border
                bg-background
                px-3
                py-2
              "
            >
              <span
                className="
                  flex
                  size-6
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  bg-muted
                  text-[10px]
                  font-semibold
                  text-muted-foreground
                "
              >
                {index + 1}
              </span>

              <span className="min-w-0 flex-1 text-xs">
                {item}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  removeInstruction(index)
                }
                className="
                  h-7
                  shrink-0
                  px-2
                  text-[11px]
                  text-muted-foreground
                  hover:bg-destructive/10
                  hover:text-destructive
                "
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}