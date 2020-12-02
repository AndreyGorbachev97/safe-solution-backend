const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } = require("docx");

module.exports = (stages, path) => {
  const doc = new Document();
  const participants = stages.reduce((acc, el, i) =>
    [...acc, ...el.participant.map((part) => ({ ...part, stage: (i + 1).toString() }))]
    , [])
  console.log('participants', participants);
  const rows = participants.map((part) => {
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph(`${part.surname} ${part.name}`)],
        }),
        new TableCell({
          children: [new Paragraph(part.vote === 'approve' ? 'Согласовано' : 'Возврат')],
        }),
        new TableCell({
          children: [new Paragraph(part.comment)],
        }),
        new TableCell({
          children: [new Paragraph(part.stage)],
        }),
        new TableCell({
          children: [new Paragraph('20-11-2020')],
        }),
      ],
    })
  });
  const table = new Table({
    width: {
      size: 9535,
      type: WidthType.DXA,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph("Согласующий")],
          }),
          new TableCell({
            children: [new Paragraph("Результат")],
          }),
          new TableCell({
            children: [new Paragraph("Примечание")],
          }),
          new TableCell({
            children: [new Paragraph("Номер этапа")],
          }),
          new TableCell({
            children: [new Paragraph("Дата и время")],
          }),
        ],
      }),
      ...rows,
    ]
  });
  doc.addSection({
    properties: {},
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: "Лист согласования",
            bold: true,
          }),
        ],
      }),
      table,
    ],
  });
  Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(path, buffer);
  });
}