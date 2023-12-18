import type { ILinkCellValue, ILinkFieldOptions } from '@teable-group/core';
import { isMultiValueLink } from '@teable-group/core';
import { Plus } from '@teable-group/icons';
import { Button, Dialog, DialogContent, DialogTrigger, useToast } from '@teable-group/ui-lib';
import { useState, useRef } from 'react';
import { ExpandRecorder } from '../../expand-record';
import type { ILinkEditorMainRef } from './EditorMain';
import { LinkEditorMain } from './EditorMain';
import { LinkCard } from './LinkCard';

interface ILinkEditorProps {
  fieldId: string;
  recordId: string | undefined;
  options: ILinkFieldOptions;
  cellValue?: ILinkCellValue | ILinkCellValue[];
  onChange?: (value?: ILinkCellValue | ILinkCellValue[]) => void;
  readonly?: boolean;
  className?: string;
}

export const LinkEditor = (props: ILinkEditorProps) => {
  const { cellValue, options, onChange, readonly, className } = props;
  const { toast } = useToast();
  const linkEditorMainRef = useRef<ILinkEditorMainRef>(null);
  const [isEditing, setEditing] = useState<boolean>(false);
  const [expandRecordId, setExpandRecordId] = useState<string>();
  const { foreignTableId, relationship } = options;

  const cvArray = Array.isArray(cellValue) || !cellValue ? cellValue : [cellValue];
  const isMultiple = isMultiValueLink(relationship);
  const recordIds = cvArray?.map((cv) => cv.id);

  const updateExpandRecordId = (recordId?: string) => {
    if (recordId) {
      const existed = document.getElementById(`${foreignTableId}-${recordId}`);
      if (existed) {
        toast({ description: 'This record is already open.' });
        return;
      }
    }
    setExpandRecordId(recordId);
  };

  const onRecordClick = (recordId: string) => {
    updateExpandRecordId(recordId);
  };

  const onDeleteRecord = (recordId: string) => {
    onChange?.(
      isMultiple ? (cellValue as ILinkCellValue[])?.filter((cv) => cv.id !== recordId) : undefined
    );
  };

  const onOpenChange = (open: boolean) => {
    if (open) return setEditing?.(true);
    return linkEditorMainRef.current?.onReset();
  };

  return (
    <div className="space-y-3">
      {cvArray?.map(({ id, title }) => (
        <LinkCard
          key={id}
          title={title}
          readonly={readonly}
          onClick={() => onRecordClick(id)}
          onDelete={() => onDeleteRecord(id)}
        />
      ))}
      <ExpandRecorder
        tableId={foreignTableId}
        recordId={expandRecordId}
        recordIds={recordIds}
        onUpdateRecordIdCallback={updateExpandRecordId}
        onClose={() => updateExpandRecordId(undefined)}
      />
      {!readonly && (
        <Dialog open={isEditing} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
            <Button variant="outline" size={'sm'} className={className}>
              <Plus />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="flex h-[520px] max-w-4xl flex-col">
            <LinkEditorMain
              {...props}
              ref={linkEditorMainRef}
              isEditing={isEditing}
              setEditing={setEditing}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};