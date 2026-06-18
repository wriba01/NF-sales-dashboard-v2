        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            color: #333;
        }
        .chart-container {
            position: relative;
            height: 400px;
            width: 100%;
        }
        .pie-chart-container {
            position: relative;
            height: 300px;
            width: 100%;
        }
        
        /* Print styles */
        @media print {
            body {
                background-color: white !important;
                color: black !important;
            }
            
            /* Hide buttons and filters when printing */
            .no-print {
                display: none !important;
            }
            
            /* Optimize cards for printing */
            .print-card {
                background-color: white !important;
                border: 1px solid #333 !important;
                box-shadow: none !important;
                page-break-inside: avoid;
                margin-bottom: 20px;
            }
            
            /* Ensure charts print properly */
            .chart-container,
            .pie-chart-container {
                page-break-inside: avoid;
            }
            
            /* Make text black for readability */
            h1, h2, h3, p, td, th, label {
                color: black !important;
            }
            
            /* Page breaks between major sections */
            .page-break {
                page-break-before: always;
            }
        }
        
        /* Single-page print styles - JavaScript handles the visibility */
        @media print {
            @page {
                size: portrait;
                margin: 0.5in;
            }
            
            /* Force section to fit on one page */
            .printing-mode {
                page-break-after: avoid;
                page-break-before: avoid;
                page-break-inside: avoid;
            }
            
            /* Remove scrollbars and max-height restrictions */
            .printing-mode * {
                max-height: none !important;
                overflow: visible !important;
            }
            
            /* Compact table styling for single page */
            .printing-mode table {
                page-break-inside: avoid;
                font-size: 10px;
                width: 100%;
            }
            
            .printing-mode th,
            .printing-mode td {
                padding: 4px 6px !important;
                font-size: 10px !important;
            }
            
            .printing-mode h2 {
                font-size: 16px !important;
                margin: 0 0 10px 0 !important;
                padding: 0 !important;
            }
            
            /* Prevent row breaks */
            .printing-mode tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }
            
            /* Compact the container */
            .printing-mode > div {
                padding: 10px !important;
            }
        }
