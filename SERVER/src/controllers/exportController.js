const { format } = require("@fast-csv/format");
const pool = require("../db");
const XLSX = require('xlsx');  // Moved out of the function for optimization

// Common fetch logic (no pagination)
const fetchMealHistory = async (query) => {
    console.log("Fetching meal history with query:", query);
  
    const {
      meal_type_id,
      employee_pin,
      employee_name,
      start_date,
      end_date,
    } = query;
  
    // SAFE conversion: if value is not a number or is empty, pass null
    const parsedMealTypeId = meal_type_id && !isNaN(meal_type_id) ? parseInt(meal_type_id, 10) : null;
    const parsedEmployeePin = employee_pin && !isNaN(employee_pin) ? parseInt(employee_pin, 10) : null;
  
    const result = await pool.query(
      `SELECT * FROM public.get_user_meal_history($1, $2, $3, $4, $5, $6, $7)`,
      [
        parsedMealTypeId,
        parsedEmployeePin,
        employee_name || null,
        start_date || null,
        end_date || null,
        null, // limit
        null, // offset
      ]
    );
   console.log("Fetched meal history:", result.rows);
    return result.rows;
   
  };

exports.exportCSV = async (req, res) => {
  try {
    const data = await fetchMealHistory(req.query);

    res.setHeader("Content-Disposition", "attachment; filename=meal_history.csv");
    res.setHeader("Content-Type", "text/csv");

    const csvStream = format({ headers: true });
    csvStream.pipe(res);

    data.forEach((item) => {
      csvStream.write({
        PIN: item.pin,
        Name: item.name,
        Department: item.department,
        "Meal Time": new Date(item.meal_time).toLocaleString(),
        "Meal Type": item.meal_type,
      });
    });

    csvStream.end();
  } catch (error) {
    console.error("Error exporting CSV:", error);
    res.status(500).send("Failed to export CSV");
  }
};


const PDFDocument = require('pdfkit');

exports.exportPDF = async (req, res) => {
  console.log("Received request to export PDF");
  const startTime = Date.now();

  try {
    const startDbQuery = Date.now();
    const data = await fetchMealHistory(req.query);
    const dbQueryTime = Date.now() - startDbQuery;
    console.log(`Database query time: ${dbQueryTime} ms`);

    const doc = new PDFDocument({ size: 'A4', margin: 20 });
    const dateTime = new Date().toLocaleString();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=MealHistoryReport.pdf');

    // Pipe and handle errors
    doc.pipe(res);
    doc.on('error', err => {
      console.error('PDF Error:', err);
      res.status(500).end();
    });

    const styles = {
      headerColor: '#2c3e50',
      rowEvenColor: '#f8f9fa',
      rowOddColor: '#ffffff',
      footerColor: '#95a5a6',
      headerFontSize: 18,
      subHeaderFontSize: 10,
      tableHeaderFontSize: 10,
      bodyFontSize: 9,
    };

    const columns = [
      { header: 'PIN', width: 60 },
      { header: 'Name', width: 120 },
      { header: 'Department', width: 100 },
      { header: 'Meal Time', width: 150 },
      { header: 'Meal Type', width: 100 },
    ];

    let isEvenRow = false;
    let pageNumber = 1;

    const addMainHeader = () => {
      doc.fillColor(styles.headerColor)
        .font('Helvetica-Bold')
        .fontSize(styles.headerFontSize)
        .text('Meal History Report', { align: 'center' })
        .moveDown(0.3);

      doc.fontSize(styles.subHeaderFontSize)
        .text(`Generated: ${dateTime}`, { align: 'center' })
        .moveDown(0.5);

      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    };

    const addFooter = () => {
      doc.save()
        .fontSize(styles.subHeaderFontSize)
        .fillColor(styles.footerColor)
        .text(`Page ${pageNumber}`, 40, doc.page.height - 40, { align: 'left' })
        .restore();
    };

    const createTableHeaders = () => {
      let y = doc.y + 5;
      doc.font('Helvetica-Bold').fontSize(styles.tableHeaderFontSize);
      let x = 40;

      columns.forEach(col => {
        doc.fill(styles.headerColor)
          .rect(x, y, col.width, 20)
          .fillAndStroke(styles.headerColor, styles.headerColor);

        doc.fillColor('#ffffff')
          .text(col.header, x + 5, y + 5, {
            width: col.width - 10,
            align: 'left',
          });

        x += col.width;
      });

      doc.y = y + 20;
    };

    const createTableRow = (row) => {
      const rowColor = isEvenRow ? styles.rowEvenColor : styles.rowOddColor;
      isEvenRow = !isEvenRow;

      let x = 40;
      let y = doc.y;
      const mealTime = new Date(row.meal_time).toLocaleString();

      const rowData = [
        row.pin,
        row.name,
        row.department,
        mealTime,
        row.meal_type
      ];

      columns.forEach((col, index) => {
        doc.rect(x, y, col.width, 20)
          .fill(rowColor)
          .stroke('#e0e0e0');

        doc.fillColor('#000000')
          .font('Helvetica')
          .fontSize(styles.bodyFontSize)
          .text(rowData[index], x + 5, y + 5, {
            width: col.width - 10,
            align: col.align || 'left'
          });

        x += col.width;
      });

      doc.y += 20;
    };

    const createNewPage = () => {
      doc.addPage();
      pageNumber++;
      createTableHeaders();
    };

    // Begin PDF
    addMainHeader();
    createTableHeaders();

    data.forEach((row) => {
      if (doc.y + 30 > doc.page.height - 60) {
        addFooter();
        createNewPage();
      }
      createTableRow(row);
    });

    addFooter();
    doc.end();

    const endTime = Date.now();
    console.log(`PDF generation time: ${endTime - startTime} ms`);
  } catch (error) {
    console.error("Error exporting PDF:", error);
    res.status(500).send("Failed to export PDF");
  }
};



exports.exportXLSX = async (req, res) => {
  try {
    const data = await fetchMealHistory(req.query);

    // Build rows for layout: title, blank, date label, blank, headers, data + blank rows
    const title = 'Datewise Meals Detail Report';
    const reportDate = new Date(data[0]?.meal_time).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    // Headers
    const headers = ['SN','EmpId','Emp Name','Dept','Designation','Nationality','Time','Meal Type'];

    // Start assembling array rows
    const sheetRows = [];
    sheetRows.push([title]);                // Row 1: Title
    sheetRows.push([]);                     // Row 2: Blank
    sheetRows.push(['Date', reportDate]);   // Row 3: Date label + value
    sheetRows.push([]);                     // Row 4: Blank
    sheetRows.push(headers);                // Row 5: Table headers

    // Data rows with interleaved blank rows
    data.forEach((item, idx) => {
      const time = new Date(item.meal_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      sheetRows.push([
        idx+1,
        item.pin,
        item.name,
        item.department,
        item.designation,
        item.nationality,
        time,
        item.meal_type
      ]);
      sheetRows.push([]);
    });

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetRows);
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    // Merge title across all columns
    worksheet['!merges'] = worksheet['!merges'] || [];
    worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } });

    // Styles
    const titleStyle = {
      font: { name: 'Calibri', sz: 16, bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '4472C4' } },      // Dark blue background
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    const labelStyle = { font: { bold: true, color: { rgb: '9C0006' } } };
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '203864' } },       // Dark blue headers
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
        left: { style: 'thin', color: { rgb: 'DDDDDD' } },
        right: { style: 'thin', color: { rgb: 'DDDDDD' } }
      }
    };
    const oddFill = { fgColor: { rgb: 'F9F9F9' } };

    // Apply title style
    worksheet['A1'].s = titleStyle;

    // Date label and value style
    worksheet['A3'].s = labelStyle;
    worksheet['B3'].s = { font: { bold: true } };

    // Header row style (row 5)
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r: 4, c });
      if (worksheet[addr]) worksheet[addr].s = headerStyle;
      worksheet['!rows'] = worksheet['!rows'] || [];
      worksheet['!rows'][4] = { hpt: 18 };
    }

    // Data row styles
    let dataStartRow = 5;
    data.forEach((_, idx) => {
      const r = dataStartRow + idx * 2;
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (!worksheet[addr]) continue;
        worksheet[addr].s = {
          fill: idx % 2 === 0 ? oddFill : {},
          alignment: { vertical: 'center', horizontal: c === 6 ? 'center' : 'left' }
        };
      }
      worksheet['!rows'][r] = { hpt: 16 };
      worksheet['!rows'][r + 1] = { hpt: 8 };
    });

    // Column widths
    worksheet['!cols'] = headers.map(h => ({ wch: Math.max(h.length, 10) + 2 }));

    // Freeze header (row 5) and apply autofilter on header row
    worksheet['!autofilter'] = { ref: XLSX.utils.encode_range({ s: { r: 4, c: 0 }, e: { r: 4, c: headers.length - 1 } }) };
    worksheet['!views'] = [{ state: 'frozen', ySplit: 5 }];

    // Append sheet and send
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meals Report');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Meals_Report.xlsx');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.send(buffer);

  } catch (err) {
    console.error('Export error:', err);
    res.status(500).send('Export failed');
  }
};
