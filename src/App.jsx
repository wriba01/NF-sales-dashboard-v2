// NF Sales Dashboard — application logic.
// Migrated from runtime-Babel single file to a Vite build. Logic unchanged;
// only the React/Chart.js dependencies are now imported (bundled) instead of
// pulled from CDN globals, and the mount lives in main.jsx.
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import * as XLSX from 'xlsx';


        // Register chartjs-plugin-datalabels but disable by default
        // Only AnnualBarChart will explicitly enable it
        Chart.register(ChartDataLabels);
        Chart.defaults.set('plugins.datalabels', {
            display: false  // Disabled by default for all charts
        });

        // Dashboard Information
        const _AUTHOR = 'William A Riba';
        const _COPYRIGHT = 'Â© 2025 WAR Analytics';
        const _VERSION = 'WAR-v1.0';
        const _BUILD_YEAR = '2025';
        console.log(`Dashboard v${_VERSION} | Built by ${_AUTHOR}`);

        // Professional color scheme designed by William A Riba (WAR) for NFO Sales Analytics
        const COLORS = ['#23668b', '#238b48', '#8b6623', '#8b2366', '#668b23', '#66238b', '#8b4823', '#48238b'];


        // CONFIGURATION
        // System designed and developed by William A Riba - 2025
        const GOOGLE_SHEETS_API_KEY = 'AIzaSyB7XLcDlSI-8xo9c_WqIhaKvnV60axqyKA';
        const SHEET_ID = '1qJuW-Y_W6jzO-ACY6fWy4mPxiHxCKZhydY7pF8pO7M4';
        const SHIPPED_SHEETS = ['2023 Shipped', '2024-2025 Shipped', '2026 Shipped'];
        const UNSHIPPED_SHEET = 'Unshipped Report';
        // Password validated server-side via /api/auth

        const BarChartComponent = React.memo(({ data }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            useEffect(() => {
                if (!chartRef.current || !data || data.length === 0) return;

                // Destroy previous chart
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');
                const currentYear = new Date().getFullYear();
                const years = Array.from({length: 6}, (_, i) => currentYear - 5 + i);

                const datasets = years.map((year, index) => ({
                    label: year.toString(),
                    data: data.map(item => item[year] || 0),
                    backgroundColor: COLORS[index % COLORS.length],
                    borderColor: COLORS[index % COLORS.length],
                    borderWidth: 1
                }));

                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(item => item.month),
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 50  // Add space at top for labels
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + (value / 1000).toFixed(0) + 'k';
                                    }
                                }
                            }
                        }
                    }
                });

                return () => {
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                };
            }, [data]);

            return <canvas ref={chartRef}></canvas>;
        });

        const SimpleBarChart = React.memo(({ data, yearsWithData }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            useEffect(() => {
                if (!chartRef.current || !data || data.length === 0) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');

                // Only show datasets for years that have data
                const datasets = yearsWithData.map((year, index) => ({
                    label: year.toString(),
                    data: data.map(item => item[year] || 0),
                    backgroundColor: COLORS[index % COLORS.length],
                    borderColor: COLORS[index % COLORS.length],
                    borderWidth: 1
                }));

                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(item => item.month),
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 50  // Add space at top for labels
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + (value / 1000).toFixed(0) + 'k';
                                    }
                                }
                            }
                        }
                    }
                });

                return () => {
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                };
            }, [data, yearsWithData]);

            return <canvas ref={chartRef}></canvas>;
        });

        // Quarterly demand bar chart — one per scope family, grouped by quarter with one bar per year
        const QTRLY_YEAR_COLORS = ['#23668b', '#238b48', '#8b6623', '#8b2366'];

        const FamilyQuarterlyChart = React.memo(({ yearData, years, familyName }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            useEffect(() => {
                if (!chartRef.current || !years || years.length === 0) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');
                const QTR_LABELS = ['Q1', 'Q2', 'Q3', 'Q4'];

                const datasets = years.map((yr, i) => ({
                    label: yr,
                    data: QTR_LABELS.map(q => (yearData[yr] && yearData[yr][q]) || 0),
                    backgroundColor: QTRLY_YEAR_COLORS[i % QTRLY_YEAR_COLORS.length] + 'cc',
                    borderColor: QTRLY_YEAR_COLORS[i % QTRLY_YEAR_COLORS.length],
                    borderWidth: 1,
                    borderRadius: 2
                }));

                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: QTR_LABELS,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const val = context && context.parsed && context.parsed.y != null ? context.parsed.y : 0;
                                        return context.dataset.label + ': ' + val.toLocaleString() + ' units';
                                    }
                                }
                            },
                            datalabels: { display: false }
                        },
                        layout: { padding: { top: 8 } },
                        scales: {
                            x: {
                                grid: { display: false },
                                ticks: { font: { size: 12 } }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) { return value.toLocaleString(); },
                                    font: { size: 11 }
                                }
                            }
                        }
                    }
                });

                return () => {
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                };
            }, [yearData, years, familyName]);

            return <canvas ref={chartRef}></canvas>;
        });

        const AnnualBarChart = React.memo(({ data }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            useEffect(() => {
                if (!chartRef.current || !data || data.length === 0) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');

                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(item => item.year.toString()),
                        datasets: [{
                            label: 'Annual Revenue',
                            data: data.map(item => item.revenue),
                            backgroundColor: '#23668b',
                            borderColor: '#23668b',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: {
                                top: 40  // Add space at top for labels
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return 'Revenue: $' + context.parsed.y.toLocaleString();
                                    }
                                }
                            },
                            datalabels: {
                                display: true,
                                anchor: 'end',
                                align: 'top',
                                formatter: function(value) {
                                    // Format as $1.2M or $812K
                                    if (value >= 1000000) {
                                        return '$' + (value / 1000000).toFixed(1) + 'M';
                                    } else {
                                        return '$' + Math.round(value / 1000) + 'K';
                                    }
                                },
                                font: {
                                    size: 24,
                                    weight: 'bold'
                                },
                                color: '#23668b'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + (value / 1000000).toFixed(1) + 'M';
                                    }
                                }
                            }
                        }
                    }
                });

                return () => {
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                };
            }, [data]);

            return <canvas ref={chartRef}></canvas>;
        });

        const HorizontalBarChart = React.memo(({ data, title }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            useEffect(() => {
                if (!chartRef.current || !data || data.length === 0) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');

                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.map(item => item.item),
                        datasets: [{
                            label: 'Quantity',
                            data: data.map(item => item.qty),
                            backgroundColor: '#23668b',
                            borderColor: '#1a4d66',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        indexAxis: 'y',  // Horizontal bars
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return 'Qty: ' + context.parsed.x.toLocaleString();
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: {
                                    display: false  // Hide quantity numbers
                                },
                                grid: {
                                    display: false
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#333',
                                    font: {
                                        size: 11
                                    }
                                }
                            }
                        }
                    }
                });

                return () => {
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                };
            }, [data]);

            return <canvas ref={chartRef}></canvas>;
        });

        const PieChartComponent = React.memo(({ data, title, showQuantity = false, showPercentage = false }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            useEffect(() => {
                if (!chartRef.current || !data || data.length === 0) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');

                // Calculate total for percentages
                const total = data.reduce((sum, item) => sum + item.value, 0);

                chartInstance.current = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: data.map(item => item.name),
                        datasets: [{
                            data: data.map(item => item.value),
                            backgroundColor: COLORS.slice(0, data.length),
                            borderColor: '#fff',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.parsed || 0;
                                        
                                        if (showPercentage) {
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return label + ': ' + percentage + '%';
                                        } else if (showQuantity) {
                                            return label + ': ' + value.toLocaleString() + ' units';
                                        } else {
                                            return label + ': $' + value.toLocaleString();
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                return () => {
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                };
            }, [data, showQuantity, showPercentage]);

            return <canvas ref={chartRef}></canvas>;
        });

        const GroupedBarChart = React.memo(({ data, title }) => {
            const chartRef = useRef(null);
            const chartInstance = useRef(null);

            useEffect(() => {
                if (!chartRef.current || !data || data.years.length === 0) return;

                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }

                const ctx = chartRef.current.getContext('2d');

                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.years,
                        datasets: data.datasets.map((dataset, index) => ({
                            label: dataset.label,
                            data: dataset.data,
                            backgroundColor: COLORS[index],
                            borderColor: COLORS[index],
                            borderWidth: 1
                        }))
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    font: {
                                        size: 14,
                                        weight: 'bold'
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': $' + context.parsed.y.toLocaleString();
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    font: {
                                        size: 12
                                    }
                                }
                            },
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '$' + (value / 1000000).toFixed(1) + 'M';
                                    }
                                }
                            }
                        }
                    }
                });

                return () => {
                    if (chartInstance.current) {
                        chartInstance.current.destroy();
                    }
                };
            }, [data]);

            return <canvas ref={chartRef}></canvas>;
        });

        // Error Boundary Component - Safety net to prevent black screens
        // Designed by William A Riba for production stability
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null, errorInfo: null };
            }

            static getDerivedStateFromError(error) {
                return { hasError: true };
            }

            componentDidCatch(error, errorInfo) {
                console.error('Dashboard Error Caught:', error, errorInfo);
                this.setState({ error, errorInfo });
            }

            render() {
                if (this.state.hasError) {
                    return (
                        <div style={{ 
                            padding: '40px', 
                            maxWidth: '800px', 
                            margin: '50px auto',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            border: '2px solid #8b2366',
                            textAlign: 'center'
                        }}>
                            <h1 style={{ color: '#8b2366', marginBottom: '20px' }}>
                                Dashboard Error Detected
                            </h1>
                            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
                                The dashboard encountered an unexpected error. Don't worry - your data is safe.
                            </p>
                            <div style={{ 
                                backgroundColor: '#fff', 
                                padding: '20px', 
                                borderRadius: '4px',
                                marginBottom: '20px',
                                textAlign: 'left',
                                fontSize: '14px',
                                color: '#333'
                            }}>
                                <strong>Error Details:</strong>
                                <pre style={{ 
                                    marginTop: '10px', 
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    color: '#8b2366'
                                }}>
                                    {this.state.error && this.state.error.toString()}
                                </pre>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#23668b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                Reload Dashboard
                            </button>
                            <p style={{ color: '#999', marginTop: '20px', fontSize: '12px' }}>
                                Dashboard v{_VERSION} | Built by {_AUTHOR}
                            </p>
                        </div>
                    );
                }

                return this.props.children;
            }
        }


        // Print individual sections
        const printSection = (sectionId) => {
            const section = document.getElementById(sectionId);
            if (!section) {
                console.error('Section not found:', sectionId);
                return;
            }
            
            // Store original display values
            const hiddenElements = [];
            
            // Hide all elements except the target section and its ancestors
            const hideElements = (element) => {
                const children = element.children;
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    
                    // Check if this child or any descendant contains the target section
                    if (!child.contains(section) && child !== section) {
                        // Hide it
                        hiddenElements.push({
                            element: child,
                            originalDisplay: child.style.display
                        });
                        child.style.display = 'none';
                    } else if (child !== section) {
                        // This child is an ancestor of the section, recurse into it
                        hideElements(child);
                    }
                }
            };
            
            // Remove maxHeight from the section's scrollable div
            const scrollableDiv = section.querySelector('div[style*="maxHeight"]');
            let originalMaxHeight = null;
            let originalOverflow = null;
            if (scrollableDiv) {
                originalMaxHeight = scrollableDiv.style.maxHeight;
                originalOverflow = scrollableDiv.style.overflowY;
                scrollableDiv.style.maxHeight = 'none';
                scrollableDiv.style.overflowY = 'visible';
            }
            
            // Mark section for printing
            section.classList.add('printing-mode');
            
            // Hide everything else
            hideElements(document.body);
            
            // Trigger print
            window.print();
            
            // Restore everything after print dialog closes
            setTimeout(() => {
                hiddenElements.forEach(({ element, originalDisplay }) => {
                    element.style.display = originalDisplay;
                });
                
                if (scrollableDiv) {
                    scrollableDiv.style.maxHeight = originalMaxHeight;
                    scrollableDiv.style.overflowY = originalOverflow;
                }
                
                section.classList.remove('printing-mode');
            }, 100);
        };

        const SalesDashboard = () => {
            const [isAuthenticated, setIsAuthenticated] = useState(false);
            const [passwordInput, setPasswordInput] = useState('');
            const [loginError, setLoginError] = useState('');
            const [loginLoading, setLoginLoading] = useState(false);
            const [rawData, setRawData] = useState([]);
            const [unshippedData, setUnshippedData] = useState([]);
            const [selectedCustomer, setSelectedCustomer] = useState('all');
            const [selectedAccountManager, setSelectedAccountManager] = useState('all');
            const [selectedHGRep, setSelectedHGRep] = useState('all');
            const [selectedYear, setSelectedYear] = useState('all');
            const [selectedTerritory, setSelectedTerritory] = useState('all');
            const [selectedClassification, setSelectedClassification] = useState('all');
            const [selectedBuyGroup, setSelectedBuyGroup] = useState('all');
            const [showNonBuyGroup, setShowNonBuyGroup] = useState(true);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);
            const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard', 'metrics', 'reps', 'buygroup', 'productdeepdive', or 'openorders'
            // Open Order Report sub-layer (inside Open Orders tab)
            const [ooView, setOoView] = useState('summary'); // 'summary' | 'report'
            const [ooMode, setOoMode] = useState('rep');     // 'rep' | 'dealer'
            const [ooRep, setOoRep] = useState('');
            const [ooDealer, setOoDealer] = useState('');
            
            // All Optics section filters (Product Deep Dive page only)
            const [allOpticsTopN, setAllOpticsTopN] = useState(50); // 50 or 100
            const [allOpticsScopeFamily, setAllOpticsScopeFamily] = useState('all'); // 'all', 'ATACR', 'NX8', 'NX6', 'SHV', 'NXS', 'NF'
            const [hiddenQtrYears, setHiddenQtrYears] = useState(new Set()); // years toggled off in quarterly chart legend
            const [allOpticsDataSource, setAllOpticsDataSource] = useState('both'); // 'shipped', 'unshipped', 'both'

            useEffect(() => {
                const auth = sessionStorage.getItem('dashboard_auth');
                if (auth === 'true') {
                    setIsAuthenticated(true);
                }
            }, []);

            useEffect(() => {
                if (isAuthenticated && rawData.length === 0) {
                    loadDataFromGoogleSheets();
                }
            }, [isAuthenticated]);

            // Reset customer filter when Account Manager changes
            useEffect(() => {
                setSelectedCustomer('all');
                setSelectedHGRep('all');
            }, [selectedAccountManager]);

            const handlePasswordSubmit = async (e) => {
                e.preventDefault();
                setLoginError('');
                setLoginLoading(true);
                try {
                    const res = await fetch('/api/auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ password: passwordInput })
                    });
                    if (res.ok) {
                        setIsAuthenticated(true);
                        sessionStorage.setItem('dashboard_auth', 'true');
                        setPasswordInput('');
                    } else {
                        setLoginError('Incorrect password. Please try again.');
                        setPasswordInput('');
                    }
                } catch (err) {
                    setLoginError('Connection error. Please try again.');
                } finally {
                    setLoginLoading(false);
                }
            };

            const handleLogout = () => {
                setIsAuthenticated(false);
                sessionStorage.removeItem('dashboard_auth');
                setRawData([]);
            };

            const handleResetFilters = () => {
                setSelectedAccountManager('all');
                setSelectedHGRep('all');
                setSelectedTerritory('all');
                setSelectedYear('all');
                setSelectedClassification('all');
                setSelectedBuyGroup('all');
                setSelectedCustomer('all');
            };

            const handlePrint = () => {
                window.print();
            };

            // === Open Order Report: build rows from the already-loaded Unshipped data ===
            // Line identity = Dealer + SKU + Scheduled Ship Date. Qty sums ONLY within an
            // identical triple; a different delivery date is always a separate line.
            const buildOpenOrderReport = (data, mode, selection) => {
                const field = mode === 'rep' ? 'hgSalesRep' : 'customer';
                const subset = data.filter(r => (r[field] || '') === selection);
                const map = new Map();
                for (const r of subset) {
                    const dealer = r.customer || '';
                    const sku = r.item || '';
                    const date = r.scheduledShipDate || '';
                    const k = dealer + '||' + sku + '||' + date;
                    if (!map.has(k)) {
                        map.set(k, { dealer, location: r.shipToLocation || '', sku, description: r.description || '', qty: 0, deliveryDate: date });
                    }
                    map.get(k).qty += (Number(r.qty) || 0);
                }
                const rows = [...map.values()].sort((a, b) =>
                    a.dealer.localeCompare(b.dealer) || a.sku.localeCompare(b.sku) || a.deliveryDate.localeCompare(b.deliveryDate));
                const dealers = new Set(rows.map(r => r.dealer));
                const units = rows.reduce((sum, r) => sum + r.qty, 0);
                return { rows, totals: { dealers: dealers.size, lines: rows.length, units } };
            };

            const exportOpenOrderXLSX = () => {
                const sel = ooMode === 'rep' ? ooRep : ooDealer;
                if (!sel) return;
                const { rows, totals } = buildOpenOrderReport(unshippedData, ooMode, sel);
                const aoa = [
                    ['Open Order Report \u2014 ' + (ooMode === 'rep' ? 'Rep' : 'Dealer') + ': ' + sel],
                    [totals.dealers + ' dealers \u00b7 ' + totals.lines + ' order lines \u00b7 ' + totals.units + ' units'],
                    [],
                    ['Dealer', 'Location', 'SKU', 'Description', 'Qty', 'Est. Delivery'],
                    ...rows.map(r => [r.dealer, r.location, r.sku, r.description, r.qty, r.deliveryDate]),
                ];
                const ws = XLSX.utils.aoa_to_sheet(aoa);
                ws['!cols'] = [{ wch: 34 }, { wch: 18 }, { wch: 10 }, { wch: 48 }, { wch: 6 }, { wch: 14 }];
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Open Orders');
                const safe = sel.replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
                XLSX.writeFile(wb, 'Open_Orders_' + safe + '.xlsx');
            };

            const loadDataFromGoogleSheets = async () => {
                setLoading(true);
                setError(null);

                try {
                    // Helper function to parse dates in "3-Dec-25" format
                    const parseSheetDate = (dateStr) => {
                        if (!dateStr) return null;
                        
                        try {
                            // Handle format like "3-Dec-25"
                            const parts = dateStr.split('-');
                            if (parts.length === 3) {
                                const day = parseInt(parts[0]);
                                const monthStr = parts[1];
                                const yearShort = parts[2];
                                
                                // Convert month name to number
                                const monthMap = {
                                    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                                };
                                const month = monthMap[monthStr];
                                
                                // Convert 2-digit year to 4-digit (assuming 20xx for now)
                                const year = 2000 + parseInt(yearShort);
                                
                                return new Date(year, month, day);
                            }
                            
                            // Fallback to standard parsing
                            return new Date(dateStr);
                        } catch (e) {
                            console.error('Date parse error:', dateStr, e);
                            return null;
                        }
                    };

                    // Load all shipped data sheets
                    const allShippedData = [];
                    
                    for (const sheetName of SHIPPED_SHEETS) {
                        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}?key=${GOOGLE_SHEETS_API_KEY}`;
                        
                        const response = await fetch(url);
                        
                        if (!response.ok) {
                            console.warn(`Failed to fetch ${sheetName}: ${response.statusText}`);
                            continue; // Skip this sheet and continue with others
                        }

                        const data = await response.json();
                        const rows = data.values;

                        if (!rows || rows.length === 0) {
                            console.warn(`No data found in ${sheetName}`);
                            continue;
                        }

                        const headers = rows[0];
                        const dataRows = rows.slice(1);

                        const processedData = dataRows.map(row => {
                            const rowData = {};
                            headers.forEach((header, index) => {
                                rowData[header] = row[index] || '';
                            });

                            // Clean price - remove $ and commas
                            const cleanPrice = (rowData['Price'] || '').toString().replace(/[$,]/g, '');
                            const price = parseFloat(cleanPrice) || 0;
                            
                            const qty = parseFloat(rowData['Qty']) || 0;
                            const shipDate = rowData['Ship Date'] || '';
                            
                            // Determine territory based on Account Manager
                            const accountManager = rowData['Primary Sales Rep'] || '';
                            let territory = '';
                            if (accountManager.includes('Williams, Jesse') || accountManager.includes('Bruner, Brandon')) {
                                territory = 'East';
                            } else if (accountManager.includes('Moulton, Taylor') || accountManager.includes('Williams, Evan')) {
                                territory = 'West';
                            } else if (accountManager.includes('Holtorf, Derek') || accountManager.includes('Riba, William')) {
                                territory = 'Central';
                            }

                            return {
                                customer: rowData['Customer'] || '',
                                purchaseOrder: rowData['Purchase Order'] || '',
                                accountManager: accountManager,
                                shipToSite: rowData['Ship-To Site'] || '',
                                customerClass: rowData['Customer Class'] || '',
                                classification: rowData['Classification'] || '',
                                orderNumber: rowData['Order Number'] || '',
                                item: rowData['Item'] || '',
                                description: rowData['Description'] || '',
                                qty: qty,
                                requestDate: rowData['Request Date'] || '',
                                scheduledShipDate: rowData['Scheduled Ship Date'] || '',
                                shipDate: shipDate,
                                shipDateParsed: parseSheetDate(shipDate),
                                invoiceNumber: rowData['Invoice Number'] || '',
                                price: price,
                                name: rowData['Name'] || '',
                                country: rowData['Country'] || '',
                                hgSalesRep: rowData['H&G Sales Rep'] || '',
                                territory: territory,
                                buyGroup: rowData['Buy Group'] || '',
                                revenue: shipDate ? price : 0,  // Only count revenue if there's a Ship Date
                                dataSource: sheetName // Track which sheet this came from
                            };
                        });

                        allShippedData.push(...processedData);
                    }

                    setRawData(allShippedData);

                    // Load Unshipped Report separately
                    const unshippedUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(UNSHIPPED_SHEET)}?key=${GOOGLE_SHEETS_API_KEY}`;
                    
                    try {
                        const unshippedResponse = await fetch(unshippedUrl);
                        
                        if (unshippedResponse.ok) {
                            const unshippedDataJson = await unshippedResponse.json();
                            const unshippedRows = unshippedDataJson.values;

                            if (unshippedRows && unshippedRows.length > 0) {
                                const unshippedHeaders = unshippedRows[0];
                                const unshippedDataRows = unshippedRows.slice(1);

                                const processedUnshipped = unshippedDataRows.map(row => {
                                    const rowData = {};
                                    unshippedHeaders.forEach((header, index) => {
                                        rowData[header] = row[index] || '';
                                    });

                                    // Map Unshipped Report columns to match shipped data structure
                                    const accountManager = rowData['Default Salesrep'] || '';
                                    let territory = '';
                                    if (accountManager.includes('Williams, Jesse') || accountManager.includes('Bruner, Brandon')) {
                                        territory = 'East';
                                    } else if (accountManager.includes('Moulton, Taylor') || accountManager.includes('Williams, Evan')) {
                                        territory = 'West';
                                    } else if (accountManager.includes('Holtorf, Derek') || accountManager.includes('Riba, William')) {
                                        territory = 'Central';
                                    }

                                    const unitPrice = parseFloat((rowData['Unit Price'] || '').toString().replace(/[$,]/g, '')) || 0;
                                    const qty = parseFloat(rowData['Qty']) || 0;
                                    const total = parseFloat((rowData['Total'] || '').toString().replace(/[$,]/g, '')) || 0;

                                    return {
                                        customer: rowData['Customer'] || '',
                                        purchaseOrder: rowData['PO Number'] || '',
                                        accountManager: accountManager,
                                        orderNumber: rowData['Order Number'] || '',
                                        orderType: rowData['Order Type'] || '',
                                        item: rowData['Item'] || '',
                                        description: rowData['Description'] || '',
                                        category: rowData['Category'] || '',
                                        qty: qty,
                                        price: unitPrice,
                                        total: total,
                                        orderedDate: rowData['Ordered Date'] || '',
                                        orderedDateParsed: parseSheetDate(rowData['Ordered Date'] || ''),
                                        scheduledShipDate: rowData['Scheduled Ship Date'] || '',
                                        scheduledShipDateParsed: parseSheetDate(rowData['Scheduled Ship Date'] || ''),
                                        shipToLocation: rowData['Ship-To Location'] || '',
                                        hgSalesRep: rowData['H&amp;g Salesrep'] || rowData['H&G Salesrep'] || '',
                                        territory: territory,
                                        buyGroup: rowData['Buy Group'] || '',
                                        status: 'Open Order'
                                    };
                                });

                                setUnshippedData(processedUnshipped);
                            }
                        }
                    } catch (unshippedError) {
                        console.warn('Could not load Unshipped Report:', unshippedError);
                        // Don't fail the whole load if unshipped data fails
                    }

                    setLoading(false);
                } catch (err) {
                    console.error('Error loading data:', err);
                    setError(err.message);
                    setLoading(false);
                }
            };

            const filteredData = useMemo(() => {
                let data = rawData;
                
                // Filter by Account Manager
                if (selectedAccountManager !== 'all') {
                    data = data.filter(row => row.accountManager === selectedAccountManager);
                }
                
                // Filter by H&G Rep
                if (selectedHGRep !== 'all') {
                    data = data.filter(row => row.hgSalesRep === selectedHGRep);
                }
                
                // Filter by Territory
                if (selectedTerritory !== 'all') {
                    data = data.filter(row => row.territory === selectedTerritory);
                }
                
                // Filter by Year
                if (selectedYear !== 'all') {
                    const yearNum = parseInt(selectedYear);
                    data = data.filter(row => {
                        if (!row.shipDateParsed) return false;
                        return row.shipDateParsed.getFullYear() === yearNum;
                    });
                }
                
                // Filter by Classification
                if (selectedClassification !== 'all') {
                    data = data.filter(row => row.classification === selectedClassification);
                }
                
                // Filter by Buy Group
                if (selectedBuyGroup !== 'all') {
                    if (selectedBuyGroup === 'NBS') {
                        data = data.filter(row => row.buyGroup === 'NBS');
                    } else if (selectedBuyGroup === 'Sports Inc') {
                        data = data.filter(row => row.buyGroup === 'SPORTS_INC');
                    } else if (selectedBuyGroup === 'Non-Buy Group') {
                        data = data.filter(row => !row.buyGroup || row.buyGroup === '');
                    }
                }
                
                // Filter by Customer
                if (selectedCustomer !== 'all') {
                    data = data.filter(row => row.customer === selectedCustomer);
                }
                
                return data;
            }, [rawData, selectedAccountManager, selectedHGRep, selectedTerritory, selectedYear, selectedClassification, selectedBuyGroup, selectedCustomer]);

            // Filtered data excluding Year filter (for Annual YoY chart)
            const filteredDataExcludingYear = useMemo(() => {
                let data = rawData;
                
                // Filter by Account Manager
                if (selectedAccountManager !== 'all') {
                    data = data.filter(row => row.accountManager === selectedAccountManager);
                }
                
                // Filter by H&G Rep
                if (selectedHGRep !== 'all') {
                    data = data.filter(row => row.hgSalesRep === selectedHGRep);
                }
                
                // Filter by Territory
                if (selectedTerritory !== 'all') {
                    data = data.filter(row => row.territory === selectedTerritory);
                }
                
                // NO YEAR FILTER HERE
                
                // Filter by Classification
                if (selectedClassification !== 'all') {
                    data = data.filter(row => row.classification === selectedClassification);
                }
                
                // Filter by Buy Group
                if (selectedBuyGroup !== 'all') {
                    if (selectedBuyGroup === 'NBS') {
                        data = data.filter(row => row.buyGroup === 'NBS');
                    } else if (selectedBuyGroup === 'Sports Inc') {
                        data = data.filter(row => row.buyGroup === 'SPORTS_INC');
                    } else if (selectedBuyGroup === 'Non-Buy Group') {
                        data = data.filter(row => !row.buyGroup || row.buyGroup === '');
                    }
                }
                
                // Filter by Customer
                if (selectedCustomer !== 'all') {
                    data = data.filter(row => row.customer === selectedCustomer);
                }
                
                return data;
            }, [rawData, selectedAccountManager, selectedHGRep, selectedTerritory, selectedClassification, selectedBuyGroup, selectedCustomer]);

            // Quarterly demand by scope family — YoY grouped view
            // X-axis: Q1–Q4. Each bar group = one year. Combines shipped (requestDate) + unshipped (orderedDateParsed)
            // Ignores the year filter so all years always show
            const quarterlyDemandByFamily = useMemo(() => {
                const FAMILIES = ['ATACR', 'NX8', 'NX6', 'SHV', 'NXS', 'NF'];
                const QTRS = ['Q1', 'Q2', 'Q3', 'Q4'];

                const getScopeFamilyFromDesc = (description) => {
                    if (!description) return null;
                    const d = description.toUpperCase();
                    if (d.includes('ATACR')) return 'ATACR';
                    if (d.includes('NX8')) return 'NX8';
                    if (d.includes('NX6')) return 'NX6';
                    if (d.includes('SHV')) return 'SHV';
                    if (d.includes('NXS')) return 'NXS';
                    return 'NF';
                };

                // acc[family][year][quarter] = qty
                const acc = {};
                FAMILIES.forEach(f => { acc[f] = {}; });
                const yearsFound = new Set();

                const addRow = (family, dateObj, qty) => {
                    if (!dateObj || !qty || qty <= 0) return;
                    const y = dateObj.getFullYear().toString();
                    const q = 'Q' + (Math.floor(dateObj.getMonth() / 3) + 1);
                    yearsFound.add(y);
                    if (!acc[family][y]) acc[family][y] = { Q1:0, Q2:0, Q3:0, Q4:0 };
                    acc[family][y][q] = (acc[family][y][q] || 0) + qty;
                };

                const parseSheetDateLocal = (dateStr) => {
                    if (!dateStr) return null;
                    try {
                        const parts = dateStr.split('-');
                        if (parts.length === 3) {
                            const day = parseInt(parts[0]);
                            const monthMap = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
                            const month = monthMap[parts[1]];
                            const year = 2000 + parseInt(parts[2]);
                            if (month === undefined || isNaN(year) || isNaN(day)) return null;
                            return new Date(year, month, day);
                        }
                        const d = new Date(dateStr);
                        return isNaN(d.getTime()) ? null : d;
                    } catch(e) { return null; }
                };

                // Shipped rows
                filteredDataExcludingYear.forEach(row => {
                    const item = (row.item || '').trim().toUpperCase();
                    if (!item.startsWith('C')) return;
                    const family = getScopeFamilyFromDesc(row.description);
                    if (!family) return;
                    const dateObj = parseSheetDateLocal(row.requestDate);
                    addRow(family, dateObj, row.qty);
                });

                // Unshipped rows — apply same filters as filteredDataExcludingYear
                let filteredUnshipped = unshippedData;
                if (selectedAccountManager !== 'all') filteredUnshipped = filteredUnshipped.filter(r => r.accountManager === selectedAccountManager);
                if (selectedHGRep !== 'all') filteredUnshipped = filteredUnshipped.filter(r => r.hgSalesRep === selectedHGRep);
                if (selectedTerritory !== 'all') filteredUnshipped = filteredUnshipped.filter(r => r.territory === selectedTerritory);
                if (selectedClassification !== 'all') filteredUnshipped = filteredUnshipped.filter(r => r.classification === selectedClassification);
                if (selectedBuyGroup !== 'all') {
                    if (selectedBuyGroup === 'NBS') filteredUnshipped = filteredUnshipped.filter(r => r.buyGroup === 'NBS');
                    else if (selectedBuyGroup === 'Sports Inc') filteredUnshipped = filteredUnshipped.filter(r => r.buyGroup === 'SPORTS_INC');
                    else if (selectedBuyGroup === 'Non-Buy Group') filteredUnshipped = filteredUnshipped.filter(r => !r.buyGroup || r.buyGroup === '');
                }
                if (selectedCustomer !== 'all') filteredUnshipped = filteredUnshipped.filter(r => r.customer === selectedCustomer);

                filteredUnshipped.forEach(row => {
                    const item = (row.item || '').trim().toUpperCase();
                    if (!item.startsWith('C')) return;
                    const family = getScopeFamilyFromDesc(row.description);
                    if (!family) return;
                    addRow(family, row.orderedDateParsed, row.qty);
                });

                const sortedYears = Array.from(yearsFound).sort();

                // Build per-family result
                const result = {};
                FAMILIES.forEach(f => {
                    const total = sortedYears.reduce((sum, yr) => {
                        return sum + QTRS.reduce((s, q) => s + ((acc[f][yr] && acc[f][yr][q]) || 0), 0);
                    }, 0);
                    result[f] = { yearData: acc[f], total };
                });

                return { result, years: sortedYears };
            }, [filteredDataExcludingYear, unshippedData, selectedAccountManager, selectedHGRep, selectedTerritory, selectedClassification, selectedBuyGroup, selectedCustomer]);

            const customers = useMemo(() => {
                // First filter by Account Manager if one is selected
                let dataToFilter = rawData;
                if (selectedAccountManager !== 'all') {
                    dataToFilter = rawData.filter(row => row.accountManager === selectedAccountManager);
                }
                
                const unique = [...new Set(dataToFilter.map(row => row.customer))].filter(c => c);
                return ['all', ...unique.sort()];
            }, [rawData, selectedAccountManager]);

            const hgReps = useMemo(() => {
                // Filter by Account Manager if one is selected
                let dataToFilter = rawData;
                if (selectedAccountManager !== 'all') {
                    dataToFilter = rawData.filter(row => row.accountManager === selectedAccountManager);
                }
                
                const unique = [...new Set(dataToFilter.map(row => row.hgSalesRep))].filter(r => r);
                return ['all', ...unique.sort()];
            }, [rawData, selectedAccountManager]);

            const accountManagers = useMemo(() => {
                const unique = [...new Set(rawData.map(row => row.accountManager))].filter(am => am);
                return ['all', ...unique.sort()];
            }, [rawData]);

            const years = useMemo(() => {
                const unique = new Set();
                rawData.forEach(row => {
                    if (row.shipDateParsed) {
                        unique.add(row.shipDateParsed.getFullYear());
                    }
                });
                return ['all', ...Array.from(unique).sort((a, b) => b - a)]; // Sort descending
            }, [rawData]);

            const territories = ['all', 'East', 'West', 'Central'];
            
            const buyGroups = ['all', 'NBS', 'Sports Inc', 'Non-Buy Group'];
            
            const classifications = useMemo(() => {
                const unique = [...new Set(rawData.map(row => row.classification))].filter(c => c);
                return ['all', ...unique.sort()];
            }, [rawData]);

            // Consolidated metrics calculation - Single pass through data
            // Designed by William A Riba for optimal performance
            const consolidatedMetrics = useMemo(() => {
                // Helper to check if item is valid
                const isValidItem = (item) => {
                    if (!item) return false;
                    const itemUpper = item.trim().toUpperCase();
                    const firstChar = itemUpper.charAt(0);
                    
                    if (firstChar === 'P') return false;
                    if (firstChar === 'C' || firstChar === 'A') return true;
                    
                    const allowedVItems = ['V171', 'V1541', 'V310', 'V1735', 'V960'];
                    if (allowedVItems.includes(itemUpper)) return true;
                    
                    const allowedSItems = ['S596A', 'S454A'];
                    if (allowedSItems.includes(itemUpper)) return true;
                    
                    return false;
                };
                
                // Initialize metrics
                let totalRevenue = 0;
                let totalUnits = 0;
                const uniqueSKUs = new Set();
                
                // SINGLE PASS through filteredData
                filteredData.forEach(row => {
                    totalRevenue += row.revenue;
                    
                    const item = (row.item || '').trim().toUpperCase();
                    if (isValidItem(item)) {
                        totalUnits += row.qty;
                        if (item) uniqueSKUs.add(item);
                    }
                });
                
                return { totalRevenue, totalUnits, uniqueSKUs };
            }, [filteredData]);

            const kpis = useMemo(() => {
                // Derive KPIs from consolidated metrics
                return {
                    totalRevenue: consolidatedMetrics.totalRevenue,
                    totalUnits: consolidatedMetrics.totalUnits,
                    uniqueSKUs: consolidatedMetrics.uniqueSKUs.size
                };
            }, [consolidatedMetrics]);

            const monthlyYoYData = useMemo(() => {
                const monthlyData = {};
                const currentYear = new Date().getFullYear();
                const startYear = currentYear - 5;

                filteredData.forEach(row => {
                    if (!row.shipDateParsed) return;
                    
                    const date = row.shipDateParsed;
                    const year = date.getFullYear();
                    const month = date.getMonth();

                    if (year < startYear || year > currentYear) return;

                    const monthName = new Date(2000, month).toLocaleString('en-US', { month: 'short' });
                    
                    if (!monthlyData[monthName]) {
                        monthlyData[monthName] = { month: monthName, monthIndex: month };
                        for (let y = startYear; y <= currentYear; y++) {
                            monthlyData[monthName][y] = 0;
                        }
                    }

                    monthlyData[monthName][year] += row.revenue;
                });

                return Object.values(monthlyData).sort((a, b) => a.monthIndex - b.monthIndex);
            }, [filteredData]);

            // Annual YoY data for simple year comparison (uses all filters EXCEPT year)
            const annualYoYData = useMemo(() => {
                const yearData = {};

                filteredDataExcludingYear.forEach(row => {
                    if (!row.shipDateParsed) return;
                    
                    const year = row.shipDateParsed.getFullYear();
                    
                    if (!yearData[year]) {
                        yearData[year] = 0;
                    }
                    
                    yearData[year] += row.revenue;
                });

                // Convert to array format for Chart.js
                return Object.entries(yearData)
                    .map(([year, revenue]) => ({ year: parseInt(year), revenue }))
                    .sort((a, b) => a.year - b.year);
            }, [filteredDataExcludingYear]);

            // Get only years that have actual data
            const yearsWithData = useMemo(() => {
                const uniqueYears = new Set();
                filteredData.forEach(row => {
                    if (row.shipDateParsed) {
                        uniqueYears.add(row.shipDateParsed.getFullYear());
                    }
                });
                return Array.from(uniqueYears).sort();
            }, [filteredData]);

            const revenueByAccountManager = useMemo(() => {
                const grouped = {};
                
                filteredData.forEach(row => {
                    const manager = row.accountManager || 'Unassigned';
                    if (!grouped[manager]) grouped[manager] = 0;
                    grouped[manager] += row.revenue;
                });

                return Object.entries(grouped)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);
            }, [filteredData]);

            const revenueByHGRep = useMemo(() => {
                const grouped = {};
                
                filteredData.forEach(row => {
                    const rep = row.hgSalesRep || 'Unassigned';
                    if (!grouped[rep]) grouped[rep] = 0;
                    grouped[rep] += row.revenue;
                });

                return Object.entries(grouped)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value);
            }, [filteredData]);

            // Optics vs Accessories breakdown
            const revenueByProductType = useMemo(() => {
                const grouped = { Optics: 0, Accessories: 0 };
                
                filteredData.forEach(row => {
                    const item = (row.item || '').trim().toUpperCase();
                    if (!item) return;
                    
                    const firstChar = item.charAt(0);
                    
                    // Skip items starting with P
                    if (firstChar === 'P') return;
                    
                    // C = Optics, A or V = Accessories
                    if (firstChar === 'C') {
                        grouped.Optics += row.qty;
                    } else if (firstChar === 'A' || firstChar === 'V') {
                        grouped.Accessories += row.qty;
                    }
                });

                return Object.entries(grouped)
                    .map(([name, value]) => ({ name, value }))
                    .filter(item => item.value > 0);
            }, [filteredData]);

            // Scope Family breakdown
            const revenueByScopeFamily = useMemo(() => {
                const families = ['ATACR', 'NX8', 'NX6', 'SHV', 'NXS', 'NF'];
                const grouped = {};
                families.forEach(family => grouped[family] = { qty: 0, revenue: 0 });
                
                filteredData.forEach(row => {
                    const description = (row.description || '').toUpperCase();
                    if (!description) return;
                    
                    let found = false;
                    for (const family of families) {
                        if (description.includes(family)) {
                            grouped[family].qty += row.qty;
                            grouped[family].revenue += row.revenue;
                            found = true;
                            break;
                        }
                    }
                    
                    // Also check for "COMP" and add to NF
                    if (!found && description.includes('COMP')) {
                        grouped['NF'].qty += row.qty;
                        grouped['NF'].revenue += row.revenue;
                    }
                });

                return Object.entries(grouped)
                    .map(([name, data]) => ({ name, value: data.qty, revenue: data.revenue }))
                    .filter(item => item.value > 0)  // Remove items with 0 qty
                    .sort((a, b) => b.value - a.value);  // Sort by qty descending
            }, [filteredData]);

            // Top Reticles breakdown
            const revenueByReticle = useMemo(() => {
                const reticles = [
                    'MOAR', 'MOAR-CF2D', 'Mil-XT', 'FC-DMx', 'MOAR-CF2', 'Mil-C', 
                    'FC-MOA', 'T3', 'Forceplex', 'Mil-R', 'NP-R2', 'MOART', 'FC-Mil', 
                    'CTR-2', 'MOA-XT', 'NP-2DD', 'FCR-1', 'Mil-CF2', 'T5', 
                    'Mil-CF2D', 'DDR-2', 'SR-2', 'H59', 'CTR-3', 'FC-DM', 'SR-1'
                ];
                
                const grouped = {};
                reticles.forEach(reticle => grouped[reticle] = { qty: 0, revenue: 0 });
                
                filteredData.forEach(row => {
                    const description = (row.description || '').toUpperCase();
                    if (!description) return;
                    
                    for (const reticle of reticles) {
                        // Match reticle name (case insensitive)
                        if (description.includes(reticle.toUpperCase())) {
                            grouped[reticle].qty += row.qty;
                            grouped[reticle].revenue += row.revenue;
                            break;  // Only count once per row
                        }
                    }
                });

                return Object.entries(grouped)
                    .map(([name, data]) => ({ name, value: data.qty, revenue: data.revenue }))
                    .filter(item => item.value > 0)  // Remove reticles with 0 qty
                    .sort((a, b) => b.value - a.value)  // Sort by qty descending
                    .slice(0, 10); // Top 10 reticles only
            }, [filteredData]);

            // NATIONAL DATA (filtered only by Year) for comparison
            const nationalData = useMemo(() => {
                if (selectedYear === 'all') {
                    return rawData;
                }
                const yearNum = parseInt(selectedYear);
                return rawData.filter(row => {
                    if (!row.shipDateParsed) return false;
                    return row.shipDateParsed.getFullYear() === yearNum;
                });
            }, [rawData, selectedYear]);

            // National Optics vs Accessories
            const nationalRevenueByProductType = useMemo(() => {
                const grouped = { Optics: 0, Accessories: 0 };
                
                nationalData.forEach(row => {
                    const item = (row.item || '').trim().toUpperCase();
                    if (!item) return;
                    
                    const firstChar = item.charAt(0);
                    
                    if (firstChar === 'P') return;
                    
                    if (firstChar === 'C') {
                        grouped.Optics += row.qty;
                    } else if (firstChar === 'A' || firstChar === 'V') {
                        grouped.Accessories += row.qty;
                    }
                });

                return Object.entries(grouped)
                    .map(([name, value]) => ({ name, value }))
                    .filter(item => item.value > 0);
            }, [nationalData]);

            // National Scope Family
            const nationalRevenueByScopeFamily = useMemo(() => {
                const families = ['ATACR', 'NX8', 'NX6', 'SHV', 'NXS', 'NF'];
                const grouped = {};
                families.forEach(family => grouped[family] = { qty: 0, revenue: 0 });
                
                nationalData.forEach(row => {
                    const description = (row.description || '').toUpperCase();
                    if (!description) return;
                    
                    let found = false;
                    for (const family of families) {
                        if (description.includes(family)) {
                            grouped[family].qty += row.qty;
                            grouped[family].revenue += row.revenue;
                            found = true;
                            break;
                        }
                    }
                    
                    if (!found && description.includes('COMP')) {
                        grouped['NF'].qty += row.qty;
                        grouped['NF'].revenue += row.revenue;
                    }
                });

                return Object.entries(grouped)
                    .map(([name, data]) => ({ name, value: data.qty, revenue: data.revenue }))
                    .filter(item => item.value > 0)
                    .sort((a, b) => b.value - a.value);
            }, [nationalData]);

            // National Top Reticles
            const nationalRevenueByReticle = useMemo(() => {
                const reticles = [
                    'MOAR', 'MOAR-CF2D', 'Mil-XT', 'FC-DMx', 'MOAR-CF2', 'Mil-C', 
                    'FC-MOA', 'T3', 'Forceplex', 'Mil-R', 'NP-R2', 'MOART', 'FC-Mil', 
                    'CTR-2', 'MOA-XT', 'NP-2DD', 'FCR-1', 'Mil-CF2', 'T5', 
                    'Mil-CF2D', 'DDR-2', 'SR-2', 'H59', 'CTR-3', 'FC-DM', 'SR-1'
                ];
                
                const grouped = {};
                reticles.forEach(reticle => grouped[reticle] = { qty: 0, revenue: 0 });
                
                nationalData.forEach(row => {
                    const description = (row.description || '').toUpperCase();
                    if (!description) return;
                    
                    for (const reticle of reticles) {
                        if (description.includes(reticle.toUpperCase())) {
                            grouped[reticle].qty += row.qty;
                            grouped[reticle].revenue += row.revenue;
                            break;
                        }
                    }
                });

                return Object.entries(grouped)
                    .map(([name, data]) => ({ name, value: data.qty, revenue: data.revenue }))
                    .filter(item => item.value > 0)
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 10);
            }, [nationalData]);

            // Top 20 Optics by quantity
            const top20Optics = useMemo(() => {
                const optics = {};
                
                filteredData.forEach(row => {
                    const item = (row.item || '').trim().toUpperCase();
                    if (!item) return;
                    
                    const firstChar = item.charAt(0);
                    
                    // Only C items (Optics)
                    if (firstChar === 'C') {
                        if (!optics[item]) {
                            optics[item] = { qty: 0, description: row.description };
                        }
                        optics[item].qty += row.qty;
                    }
                });

                return Object.entries(optics)
                    .map(([item, data]) => ({ item, qty: data.qty, description: data.description }))
                    .sort((a, b) => b.qty - a.qty)
                    .slice(0, 20);
            }, [filteredData]);

            // Top 20 Accessories by quantity
const top20Accessories = useMemo(() => {
    const allowedVItems = ['V171', 'V1541', 'V310', 'V1735', 'V960'];
    const allowedSItems = ['S596A', 'S454A'];
    const accessories = {};
    
    filteredData.forEach(row => {
        const item = (row.item || '').trim().toUpperCase();
        if (!item) return;
        
        const firstChar = item.charAt(0);
        
        // Include: All A items, specific V items, specific S items
        const isAccessory = firstChar === 'A' || 
                           allowedVItems.includes(item) || 
                           allowedSItems.includes(item);
        
        if (isAccessory) {
            if (!accessories[item]) {
                accessories[item] = { qty: 0, description: row.description };
            }
            accessories[item].qty += row.qty;
        }
    });
    
    return Object.entries(accessories)
        .map(([item, data]) => ({ item, qty: data.qty, description: data.description }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 20);
}, [filteredData]);
            
            // Year-over-Year Growth Rate
            const yoyGrowth = useMemo(() => {
                const yearlyRevenue = {};
                
                filteredData.forEach(row => {
                    if (!row.shipDateParsed) return;
                    const year = row.shipDateParsed.getFullYear();
                    if (!yearlyRevenue[year]) {
                        yearlyRevenue[year] = 0;
                    }
                    yearlyRevenue[year] += row.revenue;
                });

                const years = Object.keys(yearlyRevenue).map(y => parseInt(y)).sort();
                const growthData = [];

                for (let i = 1; i < years.length; i++) {
                    const currentYear = years[i];
                    const previousYear = years[i - 1];
                    const currentRevenue = yearlyRevenue[currentYear];
                    const previousRevenue = yearlyRevenue[previousYear];
                    const growthRate = ((currentRevenue - previousRevenue) / previousRevenue) * 100;

                    growthData.push({
                        year: currentYear,
                        revenue: currentRevenue,
                        previousRevenue: previousRevenue,
                        growthRate: growthRate
                    });
                }

                return growthData;
            }, [filteredData]);

            // Total Number of Accounts
            const totalAccounts = useMemo(() => {
                const uniqueCustomers = new Set(filteredData.map(row => row.customer).filter(c => c));
                return uniqueCustomers.size;
            }, [filteredData]);

            // Top 10 Customers by Revenue
            const top10Customers = useMemo(() => {
                const customers = {};
                
                filteredData.forEach(row => {
                    const customer = row.customer || 'Unknown';
                    if (!customers[customer]) {
                        customers[customer] = 0;
                    }
                    customers[customer] += row.revenue;
                });

                return Object.entries(customers)
                    .map(([name, revenue]) => ({ name, revenue }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 10);
            }, [filteredData]);

            // Customer Activity Status
            const customerActivityStatus = useMemo(() => {
                const customers = {};
                const today = new Date();
                const currentYear = new Date().getFullYear();
                
                // Filter unshipped data with same filters as shipped (except year)
                let filteredUnshippedForActivity = unshippedData;
                if (selectedAccountManager !== 'all') {
                    filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => row.accountManager === selectedAccountManager);
                }
                if (selectedHGRep !== 'all') {
                    filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => row.hgSalesRep === selectedHGRep);
                }
                if (selectedTerritory !== 'all') {
                    filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => row.territory === selectedTerritory);
                }
                if (selectedClassification !== 'all') {
                    filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => 
                        (row.classification || row.category || '') === selectedClassification
                    );
                }
                if (selectedBuyGroup !== 'all') {
                    if (selectedBuyGroup === 'NBS') {
                        filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => row.buyGroup === 'NBS');
                    } else if (selectedBuyGroup === 'Sports Inc') {
                        filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => row.buyGroup === 'SPORTS_INC');
                    } else if (selectedBuyGroup === 'Non-Buy Group') {
                        filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => !row.buyGroup || row.buyGroup === '');
                    }
                }
                if (selectedCustomer !== 'all') {
                    filteredUnshippedForActivity = filteredUnshippedForActivity.filter(row => row.customer === selectedCustomer);
                }
                
                // Aggregate customer data from SHIPPED data
                filteredData.forEach(row => {
                    const customer = row.customer || 'Unknown';
                    if (!customers[customer]) {
                        customers[customer] = {
                            name: customer,
                            lastOrderDate: null,
                            totalRevenue: 0,
                            ytdRevenue: 0,
                            accountManager: row.accountManager,
                            repName: row.hgSalesRep || ''
                        };
                    }
                    
                    customers[customer].totalRevenue += row.revenue;
                    
                    // Track YTD revenue (current year only)
                    if (row.shipDateParsed && row.shipDateParsed.getFullYear() === currentYear) {
                        customers[customer].ytdRevenue += row.revenue;
                    }
                    
                    // Update rep name if we have one (use most recent non-empty)
                    if (row.hgSalesRep) {
                        customers[customer].repName = row.hgSalesRep;
                    }
                    
                    // Track most recent order date from shipped data
                    if (row.shipDateParsed) {
                        if (!customers[customer].lastOrderDate || row.shipDateParsed > customers[customer].lastOrderDate) {
                            customers[customer].lastOrderDate = row.shipDateParsed;
                        }
                    }
                });
                
                // Also check UNSHIPPED data for last order dates and new accounts
                filteredUnshippedForActivity.forEach(row => {
                    const customer = row.customer || 'Unknown';
                    if (!customers[customer]) {
                        customers[customer] = {
                            name: customer,
                            lastOrderDate: null,
                            totalRevenue: 0,
                            ytdRevenue: 0,
                            accountManager: row.accountManager,
                            repName: row.hgSalesRep || ''
                        };
                    }
                    
                    // Update rep name from unshipped if empty
                    if (row.hgSalesRep && !customers[customer].repName) {
                        customers[customer].repName = row.hgSalesRep;
                    }
                    
                    // Update account manager from unshipped if empty
                    if (row.accountManager && !customers[customer].accountManager) {
                        customers[customer].accountManager = row.accountManager;
                    }
                    
                    // Use orderedDateParsed from unshipped data as potential last order date
                    const unshippedDate = row.orderedDateParsed;
                    if (unshippedDate) {
                        if (!customers[customer].lastOrderDate || unshippedDate > customers[customer].lastOrderDate) {
                            customers[customer].lastOrderDate = unshippedDate;
                        }
                    }
                });

                // Categorize customers by activity
                const active = [];
                const warm = [];
                const atRisk = [];
                const inactive = [];

                Object.values(customers).forEach(customer => {
                    if (!customer.lastOrderDate) {
                        inactive.push({ ...customer, daysSinceOrder: 999 });
                        return;
                    }

                    const daysSince = Math.floor((today - customer.lastOrderDate) / (1000 * 60 * 60 * 24));
                    const customerData = {
                        ...customer,
                        daysSinceOrder: daysSince,
                        lastOrderDateFormatted: customer.lastOrderDate.toLocaleDateString()
                    };

                    if (daysSince <= 60) {
                        active.push(customerData);
                    } else if (daysSince <= 120) {
                        warm.push(customerData);
                    } else if (daysSince <= 270) {
                        atRisk.push(customerData);
                    } else {
                        inactive.push(customerData);
                    }
                });

                // Sort Active by Last Order Date (most recent first), others by revenue
                active.sort((a, b) => b.lastOrderDate - a.lastOrderDate);
                const sortByRevenue = (a, b) => b.totalRevenue - a.totalRevenue;
                warm.sort(sortByRevenue);
                atRisk.sort(sortByRevenue);
                inactive.sort(sortByRevenue);

                // Calculate totals for each category
                const calcTotals = (list) => ({
                    count: list.length,
                    revenue: list.reduce((sum, c) => sum + c.totalRevenue, 0)
                });

                return {
                    active: { customers: active, ...calcTotals(active) },
                    warm: { customers: warm, ...calcTotals(warm) },
                    atRisk: { customers: atRisk, ...calcTotals(atRisk) },
                    inactive: { customers: inactive, ...calcTotals(inactive) }
                };
            }, [consolidatedMetrics, unshippedData, selectedAccountManager, selectedHGRep, selectedTerritory, selectedClassification, selectedBuyGroup, selectedCustomer]);

            // Customer Activity Distribution (for pie chart)
            const customerActivityDistribution = useMemo(() => {
                return [
                    { name: 'Active (0-60 days)', value: customerActivityStatus.active.count },
                    { name: 'Warm (61-120 days)', value: customerActivityStatus.warm.count },
                    { name: 'At Risk (121-270 days)', value: customerActivityStatus.atRisk.count },
                    { name: 'Inactive (270+ days)', value: customerActivityStatus.inactive.count }
                ].filter(item => item.value > 0);
            }, [customerActivityStatus]);

            // Rep Performance Metrics
            const repPerformance = useMemo(() => {
                const reps = {};
                
                filteredData.forEach(row => {
                    const rep = row.hgSalesRep || 'Unknown';
                    if (!reps[rep]) {
                        reps[rep] = {
                            name: rep,
                            revenue: 0,
                            orders: new Set(),
                            customers: new Set(),
                            opticsQty: 0,
                            accessoriesQty: 0
                        };
                    }
                    
                    reps[rep].revenue += row.revenue;
                    if (row.invoiceNumber) reps[rep].orders.add(row.invoiceNumber);
                    if (row.customer) reps[rep].customers.add(row.customer);
                    
                    // Product mix
                    const item = (row.item || '').trim().toUpperCase();
                    const firstChar = item.charAt(0);
                    if (firstChar === 'C') {
                        reps[rep].opticsQty += row.qty;
                    } else if (firstChar === 'A' || firstChar === 'V') {
                        reps[rep].accessoriesQty += row.qty;
                    }
                });

                return Object.values(reps).map(rep => {
                    const totalQty = rep.opticsQty + rep.accessoriesQty;
                    const accessoriesPercent = totalQty > 0 ? (rep.accessoriesQty / totalQty) * 100 : 0;
                    const opticsPercent = totalQty > 0 ? (rep.opticsQty / totalQty) * 100 : 0;
                    const ordersPerCustomer = rep.customers.size > 0 ? rep.orders.size / rep.customers.size : 0;
                    const avgDealSize = rep.orders.size > 0 ? rep.revenue / rep.orders.size : 0;
                    
                    // Flag if outside 60-80% accessories range
                    const isBalanced = accessoriesPercent >= 60 && accessoriesPercent <= 80;
                    
                    return {
                        name: rep.name,
                        revenue: rep.revenue,
                        orders: rep.orders.size,
                        customers: rep.customers.size,
                        ordersPerCustomer: ordersPerCustomer,
                        avgDealSize: avgDealSize,
                        opticsPercent: opticsPercent,
                        accessoriesPercent: accessoriesPercent,
                        isBalanced: isBalanced,
                        flag: !isBalanced ? 'ALERT' : 'OK'
                    };
                }).sort((a, b) => b.revenue - a.revenue);
            }, [filteredData]);

            const formatCurrency = (value) => {
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(value);
            };

            const formatNumber = (value) => {
                return new Intl.NumberFormat('en-US').format(value);
            };

            if (!isAuthenticated) {
                return (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '100vh', 
                        backgroundColor: '#1a1a1a'
                    }}>
                        <div style={{ 
                            backgroundColor: '#f5f5f5', 
                            padding: '40px', 
                            borderRadius: '8px', 
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                            width: '100%',
                            maxWidth: '400px',
                            border: '1px solid #ddd'
                        }}>
                            <h1 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>Sales Dashboard</h1>
                            <form onSubmit={handlePasswordSubmit}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#666' }}>
                                        Enter Password:
                                    </label>
                                    <input
                                        type="password"
                                        value={passwordInput}
                                        onChange={(e) => { setPasswordInput(e.target.value); setLoginError(''); }}
                                        style={{ 
                                            width: '100%', 
                                            padding: '12px', 
                                            fontSize: '16px', 
                                            border: `1px solid ${loginError ? '#c0392b' : '#ccc'}`,
                                            borderRadius: '4px',
                                            boxSizing: 'border-box',
                                            backgroundColor: '#3a3a3a',
                                            color: '#333'
                                        }}
                                        placeholder="Enter dashboard password"
                                        autoFocus
                                        disabled={loginLoading}
                                    />
                                    {loginError && (
                                        <p style={{ margin: '8px 0 0', color: '#c0392b', fontSize: '14px' }}>{loginError}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={loginLoading || !passwordInput}
                                    style={{ 
                                        width: '100%', 
                                        padding: '12px', 
                                        backgroundColor: loginLoading ? '#7aa8bf' : '#23668b', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px', 
                                        fontSize: '16px', 
                                        fontWeight: 'bold',
                                        cursor: loginLoading ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {loginLoading ? 'Verifying...' : 'Login'}
                                </button>
                            </form>
                        </div>
                    </div>
                );
            }

            return (
                <div style={{ padding: '20px', minHeight: '100vh' }}>
                    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                                <h1 style={{ margin: 0, color: '#f0f0f0' }}>Sales Performance Dashboard</h1>
                                {rawData.length > 0 && (() => {
                                    // Find the most recent order date from shipped AND unshipped data
                                    const mostRecentShipped = rawData
                                        .filter(row => row.shipDateParsed)
                                        .reduce((latest, row) => {
                                            return !latest || row.shipDateParsed > latest ? row.shipDateParsed : latest;
                                        }, null);
                                    
                                    const mostRecentUnshipped = unshippedData
                                        .filter(row => row.orderedDateParsed)
                                        .reduce((latest, row) => {
                                            return !latest || row.orderedDateParsed > latest ? row.orderedDateParsed : latest;
                                        }, null);
                                    
                                    // Use whichever is more recent
                                    let mostRecentDate = mostRecentShipped;
                                    if (mostRecentUnshipped && (!mostRecentDate || mostRecentUnshipped > mostRecentDate)) {
                                        mostRecentDate = mostRecentUnshipped;
                                    }
                                    
                                    if (mostRecentDate) {
                                        const formattedDate = mostRecentDate.toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        });
                                        return (
                                            <div style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
                                                Data Current Through: {formattedDate}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                            <div className="no-print">
                                <button
                                    onClick={handlePrint}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#238b48', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px',
                                        marginRight: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Print
                                </button>
                                <button
                                    onClick={handleResetFilters}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#23668b', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px',
                                        marginRight: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Reset Filters
                                </button>
                                <button
                                    onClick={loadDataFromGoogleSheets}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#555', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px',
                                        marginRight: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Refresh Data
                                </button>
                                <button
                                    onClick={handleLogout}
                                    style={{ 
                                        padding: '10px 20px', 
                                        backgroundColor: '#3a3a3a', 
                                        color: 'white', 
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                        
                        {/* Spacer for header */}
                        <div style={{ marginBottom: '20px' }}></div>

                        {loading && (
                            <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                                <p>Loading data from Google Sheets...</p>
                            </div>
                        )}

                        {error && (
                            <div style={{ backgroundColor: '#ffebee', padding: '20px', borderRadius: '8px', marginBottom: '20px', color: '#c62828' }}>
                                <p><strong>Error:</strong> {error}</p>
                            </div>
                        )}

                        {/* Page Navigation */}
                        <div className="no-print" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setCurrentPage('dashboard')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentPage === 'dashboard' ? '#23668b' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setCurrentPage('metrics')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentPage === 'metrics' ? '#23668b' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Performance Metrics
                            </button>
                            <button
                                onClick={() => setCurrentPage('reps')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentPage === 'reps' ? '#23668b' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Rep Performance
                            </button>
                            <button
                                onClick={() => setCurrentPage('buygroup')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentPage === 'buygroup' ? '#23668b' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Buy Group Performance
                            </button>
                            <button
                                onClick={() => setCurrentPage('productdeepdive')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentPage === 'productdeepdive' ? '#23668b' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Product Deep Dive
                            </button>
                            <button
                                onClick={() => setCurrentPage('openorders')}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: currentPage === 'openorders' ? '#23668b' : '#555',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                Open Orders Report
                            </button>
                        </div>

                        {rawData.length > 0 && currentPage === 'dashboard' && (
                            <>
                                <div className="no-print print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'center' }}>
                                        {/* Account Manager Filter */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Account Manager:
                                            </label>
                                            <select
                                                value={selectedAccountManager}
                                                onChange={(e) => setSelectedAccountManager(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333' }}
                                            >
                                                {accountManagers.map(manager => (
                                                    <option key={manager} value={manager}>
                                                        {manager === 'all' ? 'All Account Managers' : manager}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* H&G Rep Filter */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                H&G Rep:
                                            </label>
                                            <select
                                                value={selectedHGRep}
                                                onChange={(e) => setSelectedHGRep(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333' }}
                                            >
                                                {hgReps.map(rep => (
                                                    <option key={rep} value={rep}>
                                                        {rep === 'all' ? 'All H&G Reps' : rep}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Territory Filter */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Territory:
                                            </label>
                                            <select
                                                value={selectedTerritory}
                                                onChange={(e) => setSelectedTerritory(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333' }}
                                            >
                                                {territories.map(territory => (
                                                    <option key={territory} value={territory}>
                                                        {territory === 'all' ? 'All Territories' : territory}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Year Filter */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Year:
                                            </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333' }}
                                            >
                                                {years.map(year => (
                                                    <option key={year} value={year}>
                                                        {year === 'all' ? 'All Years' : year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Classification Filter */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Classification:
                                            </label>
                                            <select
                                                value={selectedClassification}
                                                onChange={(e) => setSelectedClassification(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333' }}
                                            >
                                                {classifications.map(classification => (
                                                    <option key={classification} value={classification}>
                                                        {classification === 'all' ? 'All Classifications' : classification}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Customer Filter */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Customer:
                                            </label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                                style={{ width: '100%', padding: '8px 12px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333' }}
                                            >
                                                {customers.map(customer => (
                                                    <option key={customer} value={customer}>
                                                        {customer === 'all' ? 'All Customers' : customer}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
                                        Last updated: {new Date().toLocaleString()}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Accounts</h3>
                                        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#23668b' }}>
                                            {formatNumber(totalAccounts)}
                                        </p>
                                    </div>
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Units Sold</h3>
                                        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#238b48' }}>
                                            {formatNumber(kpis.totalUnits)}
                                        </p>
                                    </div>
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Unique SKUs</h3>
                                        <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#8b6623' }}>
                                            {formatNumber(kpis.uniqueSKUs)}
                                        </p>
                                    </div>
                                </div>

                                <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Annual Shipped - Year Over Year</h2>
                                    <div className="chart-container">
                                        <AnnualBarChart data={annualYoYData} />
                                    </div>
                                </div>

                                <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Monthly Shipped Breakdown</h2>
                                    <div className="chart-container">
                                        <SimpleBarChart data={monthlyYoYData} yearsWithData={yearsWithData} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                                    {/* Optics vs Accessories */}
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Optics vs Accessories</h2>
                                        <div className="pie-chart-container">
                                            <PieChartComponent data={revenueByProductType} title="Product Type" showPercentage={true} />
                                        </div>
                                        
                                        {/* Comparison Table */}
                                        <div style={{ marginTop: '20px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>Type</th>
                                                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>%</th>
                                                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>National %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const filteredTotal = revenueByProductType.reduce((sum, item) => sum + item.value, 0);
                                                        const nationalTotal = nationalRevenueByProductType.reduce((sum, item) => sum + item.value, 0);
                                                        
                                                        const types = ['Optics', 'Accessories'];
                                                        return types.map((type, index) => {
                                                            const filteredItem = revenueByProductType.find(item => item.name === type);
                                                            const nationalItem = nationalRevenueByProductType.find(item => item.name === type);
                                                            
                                                            const filteredPercent = filteredItem && filteredTotal > 0 
                                                                ? ((filteredItem.value / filteredTotal) * 100).toFixed(1) 
                                                                : '0.0';
                                                            const nationalPercent = nationalItem && nationalTotal > 0 
                                                                ? ((nationalItem.value / nationalTotal) * 100).toFixed(1) 
                                                                : '0.0';
                                                            
                                                            return (
                                                                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                    <td style={{ padding: '8px', color: '#333', fontWeight: 'bold' }}>{type}</td>
                                                                    <td style={{ padding: '8px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{filteredPercent}%</td>
                                                                    <td style={{ padding: '8px', color: '#666', textAlign: 'right' }}>{nationalPercent}%</td>
                                                                </tr>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Scope Family */}
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Scope Family</h2>
                                        <div className="pie-chart-container">
                                            <PieChartComponent data={revenueByScopeFamily} title="Scope Family" showPercentage={true} />
                                        </div>
                                        
                                        {/* Comparison Table */}
                                        <div style={{ marginTop: '20px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>Family</th>
                                                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>%</th>
                                                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>National %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const filteredTotal = revenueByScopeFamily.reduce((sum, item) => sum + item.value, 0);
                                                        const nationalTotal = nationalRevenueByScopeFamily.reduce((sum, item) => sum + item.value, 0);
                                                        
                                                        const families = ['ATACR', 'NX8', 'NX6', 'SHV', 'NXS', 'NF'];
                                                        return families.map((family, index) => {
                                                            const filteredItem = revenueByScopeFamily.find(item => item.name === family);
                                                            const nationalItem = nationalRevenueByScopeFamily.find(item => item.name === family);
                                                            
                                                            const filteredPercent = filteredItem && filteredTotal > 0 
                                                                ? ((filteredItem.value / filteredTotal) * 100).toFixed(1) 
                                                                : '0.0';
                                                            const nationalPercent = nationalItem && nationalTotal > 0 
                                                                ? ((nationalItem.value / nationalTotal) * 100).toFixed(1) 
                                                                : '0.0';
                                                            
                                                            return (
                                                                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                    <td style={{ padding: '8px', color: '#333', fontWeight: 'bold' }}>{family}</td>
                                                                    <td style={{ padding: '8px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{filteredPercent}%</td>
                                                                    <td style={{ padding: '8px', color: '#666', textAlign: 'right' }}>{nationalPercent}%</td>
                                                                </tr>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Top Reticles */}
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Top 10 Reticles</h2>
                                        <div className="pie-chart-container">
                                            <PieChartComponent data={revenueByReticle} title="Reticles" showPercentage={true} />
                                        </div>
                                        
                                        {/* Comparison Table */}
                                        <div style={{ marginTop: '20px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>Reticle</th>
                                                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>%</th>
                                                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333', fontWeight: 'bold' }}>National %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const filteredTotal = revenueByReticle.reduce((sum, item) => sum + item.value, 0);
                                                        const nationalTotal = nationalRevenueByReticle.reduce((sum, item) => sum + item.value, 0);
                                                        
                                                        // Get all unique reticle names from both filtered and national data
                                                        const allReticles = [...new Set([
                                                            ...revenueByReticle.map(item => item.name),
                                                            ...nationalRevenueByReticle.map(item => item.name)
                                                        ])];
                                                        
                                                        return allReticles.map((reticle, index) => {
                                                            const filteredItem = revenueByReticle.find(item => item.name === reticle);
                                                            const nationalItem = nationalRevenueByReticle.find(item => item.name === reticle);
                                                            
                                                            const filteredPercent = filteredItem && filteredTotal > 0 
                                                                ? ((filteredItem.value / filteredTotal) * 100).toFixed(1) 
                                                                : '0.0';
                                                            const nationalPercent = nationalItem && nationalTotal > 0 
                                                                ? ((nationalItem.value / nationalTotal) * 100).toFixed(1) 
                                                                : '0.0';
                                                            
                                                            return (
                                                                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                    <td style={{ padding: '8px', color: '#333', fontWeight: 'bold' }}>{reticle}</td>
                                                                    <td style={{ padding: '8px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{filteredPercent}%</td>
                                                                    <td style={{ padding: '8px', color: '#666', textAlign: 'right' }}>{nationalPercent}%</td>
                                                                </tr>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Top 20 Optics and Accessories */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginTop: '30px' }}>
                                    {/* Top 20 Optics Chart */}
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Top 20 Optics</h2>
                                        <div style={{ height: '500px' }}>
                                            <HorizontalBarChart data={top20Optics} title="Top 20 Optics" />
                                        </div>
                                    </div>

                                    {/* Top 20 Accessories Chart */}
                                    <div className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Top 20 Accessories</h2>
                                        <div style={{ height: '500px' }}>
                                            <HorizontalBarChart data={top20Accessories} title="Top 20 Accessories" />
                                        </div>
                                    </div>
                                </div>

                                {/* Top 20 Lists with Descriptions */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', marginTop: '30px' }}>
                                    {/* Top 20 Optics List */}
                                    <div id="top20-optics-detail" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd', position: 'relative' }}>
                                        <button 
                                            onClick={() => printSection('top20-optics-detail')}
                                            className="no-print"
                                            style={{ 
                                                position: 'absolute',
                                                top: '20px',
                                                right: '20px',
                                                padding: '8px 16px',
                                                backgroundColor: '#238b48',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Print
                                        </button>
                                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Top 20 Optics - Detail</h2>
                                        <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                    <tr>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {top20Optics.map((item, index) => (
                                                        <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                            <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{item.item}</td>
                                                            <td style={{ padding: '10px', color: '#666' }}>{item.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Top 20 Accessories List */}
                                    <div id="top20-accessories-detail" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd', position: 'relative' }}>
                                        <button 
                                            onClick={() => printSection('top20-accessories-detail')}
                                            className="no-print"
                                            style={{ 
                                                position: 'absolute',
                                                top: '20px',
                                                right: '20px',
                                                padding: '8px 16px',
                                                backgroundColor: '#238b48',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}
                                        >
                                            Print
                                        </button>
                                        <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Top 20 Accessories - Detail</h2>
                                        <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                    <tr>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {top20Accessories.map((item, index) => (
                                                        <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                            <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{item.item}</td>
                                                            <td style={{ padding: '10px', color: '#666' }}>{item.description}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Performance Metrics Page */}
                        {rawData.length > 0 && currentPage === 'metrics' && (
                            <>
                                {/* Filters for Performance Metrics */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Account Manager:
                                            </label>
                                            <select
                                                value={selectedAccountManager}
                                                onChange={(e) => setSelectedAccountManager(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {accountManagers.map(manager => (
                                                    <option key={manager} value={manager}>
                                                        {manager === 'all' ? 'All Account Managers' : manager}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                H&G Rep:
                                            </label>
                                            <select
                                                value={selectedHGRep}
                                                onChange={(e) => setSelectedHGRep(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {hgReps.map(rep => (
                                                    <option key={rep} value={rep}>
                                                        {rep === 'all' ? 'All H&G Reps' : rep}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Territory:
                                            </label>
                                            <select
                                                value={selectedTerritory}
                                                onChange={(e) => setSelectedTerritory(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {territories.map(territory => (
                                                    <option key={territory} value={territory}>
                                                        {territory === 'all' ? 'All Territories' : territory}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Year:
                                            </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {years.map(year => (
                                                    <option key={year} value={year}>
                                                        {year === 'all' ? 'All Years' : year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Classification:
                                            </label>
                                            <select
                                                value={selectedClassification}
                                                onChange={(e) => setSelectedClassification(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {classifications.map(classification => (
                                                    <option key={classification} value={classification}>
                                                        {classification === 'all' ? 'All Classifications' : classification}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Customer:
                                            </label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {customers.map(customer => (
                                                    <option key={customer} value={customer}>
                                                        {customer === 'all' ? 'All Customers' : customer}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Number of Accounts */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Account Overview</h2>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ color: '#666', marginBottom: '5px' }}>Total Number of Accounts</p>
                                        <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#23668b', margin: 0 }}>
                                            {totalAccounts}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Activity Status */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Customer Activity Status</h2>
                                    
                                    {/* Status KPI Cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                                        <div style={{ backgroundColor: '#d4edda', padding: '15px', borderRadius: '8px', border: '2px solid #238b48' }}>
                                            <div style={{ fontSize: '12px', color: '#155724', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#238b48' }}></span>
                                                ACTIVE (0-60 days)
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>{customerActivityStatus.active.count}</div>
                                            <div style={{ fontSize: '14px', color: '#155724' }}>{formatCurrency(customerActivityStatus.active.revenue)}</div>
                                        </div>
                                        <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', border: '2px solid #8b6623' }}>
                                            <div style={{ fontSize: '12px', color: '#856404', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8b6623' }}></span>
                                                WARM (61-120 days)
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#856404' }}>{customerActivityStatus.warm.count}</div>
                                            <div style={{ fontSize: '14px', color: '#856404' }}>{formatCurrency(customerActivityStatus.warm.revenue)}</div>
                                        </div>
                                        <div style={{ backgroundColor: '#ffe5d0', padding: '15px', borderRadius: '8px', border: '2px solid #ff8800' }}>
                                            <div style={{ fontSize: '12px', color: '#cc6600', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff8800' }}></span>
                                                AT RISK (121-270 days)
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#cc6600' }}>{customerActivityStatus.atRisk.count}</div>
                                            <div style={{ fontSize: '14px', color: '#cc6600' }}>{formatCurrency(customerActivityStatus.atRisk.revenue)}</div>
                                        </div>
                                        <div style={{ backgroundColor: '#f8d7da', padding: '15px', borderRadius: '8px', border: '2px solid #8b2366' }}>
                                            <div style={{ fontSize: '12px', color: '#721c24', fontWeight: 'bold', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8b2366' }}></span>
                                                INACTIVE (270+ days)
                                            </div>
                                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#721c24' }}>{customerActivityStatus.inactive.count}</div>
                                            <div style={{ fontSize: '14px', color: '#721c24' }}>{formatCurrency(customerActivityStatus.inactive.revenue)}</div>
                                        </div>
                                    </div>

                                    {/* Distribution Pie Chart */}
                                    <div style={{ marginBottom: '30px' }}>
                                        <h3 style={{ color: '#333', marginBottom: '15px' }}>Customer Distribution</h3>
                                        <div className="pie-chart-container">
                                            <PieChartComponent 
                                                data={customerActivityDistribution} 
                                                title="Customer Activity" 
                                                showQuantity={true}
                                            />
                                        </div>
                                    </div>

                                    {/* At Risk Customers Table */}
                                    <div style={{ marginBottom: '30px' }}>
                                        <h3 style={{ color: '#cc6600', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ff8800' }}></span>
                                            At Risk Customers (Call List)
                                        </h3>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                    <tr>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ff8800', color: '#333' }}>Rank</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ff8800', color: '#333' }}>Customer</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ff8800', color: '#333' }}>Account Manager</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ff8800', color: '#333' }}>Rep Name</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ff8800', color: '#333' }}>Last Order</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ff8800', color: '#333' }}>Days Ago</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #ff8800', color: '#333' }}>Total Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customerActivityStatus.atRisk.customers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                No at-risk customers - Great job!
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        customerActivityStatus.atRisk.customers.map((customer, index) => (
                                                            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                <td style={{ padding: '10px', color: '#cc6600', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{customer.name}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.accountManager || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.repName || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666', textAlign: 'right' }}>{customer.lastOrderDateFormatted}</td>
                                                                <td style={{ padding: '10px', color: '#cc6600', textAlign: 'right', fontWeight: 'bold' }}>{customer.daysSinceOrder} days</td>
                                                                <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(customer.totalRevenue)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Inactive Customers Table */}
                                    <div style={{ marginBottom: '30px' }}>
                                        <h3 style={{ color: '#721c24', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#8b2366' }}></span>
                                            Inactive Customers (Win-Back List)
                                        </h3>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                    <tr>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b2366', color: '#333' }}>Rank</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b2366', color: '#333' }}>Customer</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b2366', color: '#333' }}>Account Manager</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b2366', color: '#333' }}>Rep Name</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #8b2366', color: '#333' }}>Last Order</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #8b2366', color: '#333' }}>Days Ago</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #8b2366', color: '#333' }}>Total Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customerActivityStatus.inactive.customers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                No inactive customers - Excellent retention!
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        customerActivityStatus.inactive.customers.map((customer, index) => (
                                                            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                <td style={{ padding: '10px', color: '#721c24', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{customer.name}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.accountManager || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.repName || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666', textAlign: 'right' }}>{customer.lastOrderDateFormatted}</td>
                                                                <td style={{ padding: '10px', color: '#721c24', textAlign: 'right', fontWeight: 'bold' }}>
                                                                    {customer.daysSinceOrder === 999 ? 'Never' : `${customer.daysSinceOrder} days`}
                                                                </td>
                                                                <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(customer.totalRevenue)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Warm Customers Table */}
                                    <div>
                                        <h3 style={{ color: '#856404', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#8b6623' }}></span>
                                            Warm Customers (Monitor)
                                        </h3>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                    <tr>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b6623', color: '#333' }}>Rank</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b6623', color: '#333' }}>Customer</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b6623', color: '#333' }}>Account Manager</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #8b6623', color: '#333' }}>Rep Name</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #8b6623', color: '#333' }}>Last Order</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #8b6623', color: '#333' }}>Days Ago</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #8b6623', color: '#333' }}>Total Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customerActivityStatus.warm.customers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                No warm customers
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        customerActivityStatus.warm.customers.map((customer, index) => (
                                                            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                <td style={{ padding: '10px', color: '#856404', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{customer.name}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.accountManager || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.repName || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666', textAlign: 'right' }}>{customer.lastOrderDateFormatted}</td>
                                                                <td style={{ padding: '10px', color: '#856404', textAlign: 'right', fontWeight: 'bold' }}>{customer.daysSinceOrder} days</td>
                                                                <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(customer.totalRevenue)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Active Customers (All Good) Table */}
                                    <div style={{ marginBottom: '30px' }}>
                                        <h3 style={{ color: '#155724', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#238b48' }}></span>
                                            Active Customers (All Good)
                                        </h3>
                                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                    <tr>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #238b48', color: '#333' }}>Rank</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #238b48', color: '#333' }}>Customer</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #238b48', color: '#333' }}>Account Manager</th>
                                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #238b48', color: '#333' }}>Rep Name</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #238b48', color: '#333' }}>Last Order</th>
                                                        <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #238b48', color: '#333' }}>YTD Revenue</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {customerActivityStatus.active.customers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                No active customers found
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        customerActivityStatus.active.customers.map((customer, index) => (
                                                            <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                <td style={{ padding: '10px', color: '#155724', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{customer.name}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.accountManager || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666' }}>{customer.repName || 'N/A'}</td>
                                                                <td style={{ padding: '10px', color: '#666', textAlign: 'right' }}>{customer.lastOrderDateFormatted}</td>
                                                                <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(customer.ytdRevenue)}</td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Year-over-Year Growth */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Year-over-Year Growth Rate</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Year</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Revenue</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Previous Year</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Growth Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {yoyGrowth.map((item, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                    <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{item.year}</td>
                                                    <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{formatCurrency(item.revenue)}</td>
                                                    <td style={{ padding: '10px', color: '#666', textAlign: 'right' }}>{formatCurrency(item.previousRevenue)}</td>
                                                    <td style={{ 
                                                        padding: '10px', 
                                                        textAlign: 'right',
                                                        color: item.growthRate >= 0 ? '#238b48' : '#8b2366',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        {item.growthRate >= 0 ? '+' : ''}{item.growthRate.toFixed(1)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Top 10 Accounts by Revenue - Table Only */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Top 10 Accounts by Revenue</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Customer</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Total Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {top10Customers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                        No customer data available
                                                    </td>
                                                </tr>
                                            ) : (
                                                top10Customers.map((customer, index) => (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{customer.name}</td>
                                                        <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>
                                                            {formatCurrency(customer.revenue)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </>
                        )}

                        {/* Rep Performance Page */}
                        {rawData.length > 0 && currentPage === 'reps' && (
                            <>
                                {/* Filters for Rep Performance */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Account Manager:
                                            </label>
                                            <select
                                                value={selectedAccountManager}
                                                onChange={(e) => setSelectedAccountManager(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {accountManagers.map(manager => (
                                                    <option key={manager} value={manager}>
                                                        {manager === 'all' ? 'All Account Managers' : manager}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                H&G Rep:
                                            </label>
                                            <select
                                                value={selectedHGRep}
                                                onChange={(e) => setSelectedHGRep(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {hgReps.map(rep => (
                                                    <option key={rep} value={rep}>
                                                        {rep === 'all' ? 'All H&G Reps' : rep}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Territory:
                                            </label>
                                            <select
                                                value={selectedTerritory}
                                                onChange={(e) => setSelectedTerritory(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {territories.map(territory => (
                                                    <option key={territory} value={territory}>
                                                        {territory === 'all' ? 'All Territories' : territory}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Year:
                                            </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {years.map(year => (
                                                    <option key={year} value={year}>
                                                        {year === 'all' ? 'All Years' : year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Classification:
                                            </label>
                                            <select
                                                value={selectedClassification}
                                                onChange={(e) => setSelectedClassification(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {classifications.map(classification => (
                                                    <option key={classification} value={classification}>
                                                        {classification === 'all' ? 'All Classifications' : classification}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', marginRight: '10px', display: 'block', marginBottom: '8px' }}>
                                                Customer:
                                            </label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {customers.map(customer => (
                                                    <option key={customer} value={customer}>
                                                        {customer === 'all' ? 'All Customers' : customer}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Rep Comparison Table */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Rep Performance Comparison</h2>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rep Name</th>
                                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Revenue</th>
                                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Orders</th>
                                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Customers</th>
                                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Orders/Customer</th>
                                                    <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Avg Deal Size</th>
                                                    <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {repPerformance.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                            No rep data available
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    repPerformance.map((rep, index) => (
                                                        <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                            <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{rep.name}</td>
                                                            <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{formatCurrency(rep.revenue)}</td>
                                                            <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{rep.orders}</td>
                                                            <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{rep.customers}</td>
                                                            <td style={{ padding: '10px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{rep.ordersPerCustomer.toFixed(2)}</td>
                                                            <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{formatCurrency(rep.avgDealSize)}</td>
                                                            <td style={{ padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: rep.isBalanced ? '#238b48' : '#cc6600' }}>{rep.flag}</td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Orders per Customer Chart */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Orders per Customer (Repeat Business)</h2>
                                    <div style={{ height: '400px' }}>
                                        <HorizontalBarChart 
                                            data={repPerformance.map(r => ({ item: r.name, qty: r.ordersPerCustomer }))} 
                                            title="Orders per Customer" 
                                        />
                                    </div>
                                </div>

                                {/* Average Deal Size Chart */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Average Deal Size by Rep</h2>
                                    <div style={{ height: '400px' }}>
                                        <HorizontalBarChart 
                                            data={repPerformance.map(r => ({ item: r.name, qty: r.avgDealSize }))} 
                                            title="Average Deal Size" 
                                        />
                                    </div>
                                </div>

                                {/* Product Mix Table */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Product Mix by Rep (Target: 70% Accessories / 30% Optics)</h2>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rep</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Accessories %</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Optics %</th>
                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {repPerformance.map((rep, index) => (
                                                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0', backgroundColor: rep.isBalanced ? '#f9f9f9' : '#fff3cd' }}>
                                                    <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{rep.name}</td>
                                                    <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{rep.accessoriesPercent.toFixed(1)}%</td>
                                                    <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{rep.opticsPercent.toFixed(1)}%</td>
                                                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: rep.isBalanced ? '#238b48' : '#cc6600' }}>{rep.flag}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                            </>
                        )}

                        {/* Buy Group Performance Page */}
                        {rawData.length > 0 && currentPage === 'buygroup' && (
                            <>
                                {/* Filters for Buy Group Performance */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Account Manager:
                                            </label>
                                            <select
                                                value={selectedAccountManager}
                                                onChange={(e) => setSelectedAccountManager(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {accountManagers.map(manager => (
                                                    <option key={manager} value={manager}>
                                                        {manager === 'all' ? 'All' : manager}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                H&G Rep:
                                            </label>
                                            <select
                                                value={selectedHGRep}
                                                onChange={(e) => setSelectedHGRep(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {hgReps.map(rep => (
                                                    <option key={rep} value={rep}>
                                                        {rep === 'all' ? 'All' : rep}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Territory:
                                            </label>
                                            <select
                                                value={selectedTerritory}
                                                onChange={(e) => setSelectedTerritory(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {territories.map(territory => (
                                                    <option key={territory} value={territory}>
                                                        {territory === 'all' ? 'All Territories' : territory}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Year:
                                            </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {years.map(year => (
                                                    <option key={year} value={year}>
                                                        {year === 'all' ? 'All Years' : year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Classification:
                                            </label>
                                            <select
                                                value={selectedClassification}
                                                onChange={(e) => setSelectedClassification(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {classifications.map(classification => (
                                                    <option key={classification} value={classification}>
                                                        {classification === 'all' ? 'All Classifications' : classification}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Buy Group:
                                            </label>
                                            <select
                                                value={selectedBuyGroup}
                                                onChange={(e) => setSelectedBuyGroup(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {buyGroups.map(group => (
                                                    <option key={group} value={group}>
                                                        {group === 'all' ? 'All Groups' : group}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Customer:
                                            </label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {customers.map(customer => (
                                                    <option key={customer} value={customer}>
                                                        {customer === 'all' ? 'All Customers' : customer}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Toggle for Non-Buy Group */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        id="showNonBuyGroup"
                                        checked={showNonBuyGroup}
                                        onChange={(e) => setShowNonBuyGroup(e.target.checked)}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="showNonBuyGroup" style={{ fontWeight: 'bold', color: '#333', cursor: 'pointer', fontSize: '16px' }}>
                                        Show Non-Buy Group Data
                                    </label>
                                </div>

                                {(() => {
                                    // Product filter function (same as Dashboard Top 20)
                                    const isValidItem = (item) => {
                                        if (!item) return false;
                                        const itemUpper = item.trim().toUpperCase();
                                        const firstChar = itemUpper.charAt(0);
                                        const allowedVItems = ['V171', 'V1541', 'V310', 'V1735', 'V960'];
                                        const allowedSItems = ['S596A', 'S454A'];
                                        
                                        if (firstChar === 'C' || firstChar === 'A') return true;
                                        if (allowedVItems.includes(itemUpper)) return true;
                                        if (allowedSItems.includes(itemUpper)) return true;
                                        return false;
                                    };

                                    // Helper to get buy group label
                                    const getBuyGroupLabel = (buyGroup) => {
                                        if (buyGroup === 'NBS') return 'NBS';
                                        if (buyGroup === 'SPORTS_INC') return 'Sports Inc';
                                        return 'Non-Buy Group';
                                    };

                                    // Calculate annual revenue by buy group for grouped bar chart
                                    const buyGroupRevenueData = (() => {
                                        const groupedData = {};
                                        
                                        filteredData.forEach(row => {
                                            if (!row.shipDateParsed) return;
                                            
                                            const year = row.shipDateParsed.getFullYear();
                                            const group = getBuyGroupLabel(row.buyGroup);
                                            
                                            // Skip Non-Buy Group if toggle is off
                                            if (!showNonBuyGroup && group === 'Non-Buy Group') return;
                                            
                                            if (!groupedData[year]) {
                                                groupedData[year] = { NBS: 0, 'Sports Inc': 0, 'Non-Buy Group': 0 };
                                            }
                                            
                                            groupedData[year][group] += row.revenue;
                                        });
                                        
                                        const years = Object.keys(groupedData).sort();
                                        const datasets = [
                                            {
                                                label: 'NBS',
                                                data: years.map(year => groupedData[year]['NBS'])
                                            },
                                            {
                                                label: 'Sports Inc',
                                                data: years.map(year => groupedData[year]['Sports Inc'])
                                            }
                                        ];
                                        
                                        if (showNonBuyGroup) {
                                            datasets.push({
                                                label: 'Non-Buy Group',
                                                data: years.map(year => groupedData[year]['Non-Buy Group'])
                                            });
                                        }
                                        
                                        return { years, datasets };
                                    })();

                                    // Calculate YoY Growth per group (with valid items filter and all active filters EXCEPT year)
                                    const yoyGrowthData = (() => {
                                        const currentYearData = {};
                                        const previousYearData = {};
                                        
                                        const currentYear = selectedYear === 'all' ? new Date().getFullYear() : parseInt(selectedYear);
                                        const previousYear = currentYear - 1;
                                        
                                        // Use rawData and manually apply all filters EXCEPT year
                                        rawData.forEach(row => {
                                            if (!row.shipDateParsed || !isValidItem(row.item)) return;
                                            
                                            // Apply all filters except year
                                            if (selectedAccountManager !== 'all' && row.accountManager !== selectedAccountManager) return;
                                            if (selectedHGRep !== 'all' && row.hgSalesRep !== selectedHGRep) return;
                                            if (selectedTerritory !== 'all' && row.territory !== selectedTerritory) return;
                                            if (selectedClassification !== 'all' && row.classification !== selectedClassification) return;
                                            if (selectedCustomer !== 'all' && row.customer !== selectedCustomer) return;
                                            
                                            const year = row.shipDateParsed.getFullYear();
                                            const group = getBuyGroupLabel(row.buyGroup);
                                            
                                            // Apply Buy Group filter
                                            if (selectedBuyGroup !== 'all') {
                                                if (selectedBuyGroup === 'NBS' && group !== 'NBS') return;
                                                if (selectedBuyGroup === 'Sports Inc' && group !== 'Sports Inc') return;
                                                if (selectedBuyGroup === 'Non-Buy Group' && group !== 'Non-Buy Group') return;
                                            }
                                            
                                            // Skip Non-Buy Group if toggle is off
                                            if (!showNonBuyGroup && group === 'Non-Buy Group') return;
                                            
                                            if (year === currentYear) {
                                                if (!currentYearData[group]) currentYearData[group] = 0;
                                                currentYearData[group] += row.qty;
                                            } else if (year === previousYear) {
                                                if (!previousYearData[group]) previousYearData[group] = 0;
                                                previousYearData[group] += row.qty;
                                            }
                                        });
                                        
                                        const groups = showNonBuyGroup ? ['NBS', 'Sports Inc', 'Non-Buy Group'] : ['NBS', 'Sports Inc'];
                                        
                                        return groups.map(group => {
                                            const currentUnits = currentYearData[group] || 0;
                                            const previousUnits = previousYearData[group] || 0;
                                            const growth = previousUnits === 0 ? 0 : ((currentUnits - previousUnits) / previousUnits) * 100;
                                            
                                            return {
                                                group,
                                                currentUnits,
                                                previousUnits,
                                                growth
                                            };
                                        });
                                    })();

                                    // Calculate Total Accounts per group (using filteredData)
                                    const accountsPerGroup = (() => {
                                        const accounts = { NBS: new Set(), 'Sports Inc': new Set(), 'Non-Buy Group': new Set() };
                                        
                                        filteredData.forEach(row => {
                                            if (!row.customer) return;
                                            const group = getBuyGroupLabel(row.buyGroup);
                                            
                                            // Skip Non-Buy Group if toggle is off
                                            if (!showNonBuyGroup && group === 'Non-Buy Group') return;
                                            
                                            accounts[group].add(row.customer);
                                        });
                                        
                                        const result = {
                                            NBS: accounts['NBS'].size,
                                            'Sports Inc': accounts['Sports Inc'].size
                                        };
                                        
                                        if (showNonBuyGroup) {
                                            result['Non-Buy Group'] = accounts['Non-Buy Group'].size;
                                        }
                                        
                                        return result;
                                    })();

                                    // Calculate New Accounts per group (using filteredData to respect all filters)
                                    const newAccountsData = (() => {
                                        // Helper to check if row matches current filters (excluding year filter)
                                        const matchesNonYearFilters = (row) => {
                                            if (selectedAccountManager !== 'all' && row.accountManager !== selectedAccountManager) return false;
                                            if (selectedHGRep !== 'all' && row.hgSalesRep !== selectedHGRep) return false;
                                            if (selectedTerritory !== 'all' && row.territory !== selectedTerritory) return false;
                                            if (selectedClassification !== 'all' && row.classification !== selectedClassification) return false;
                                            if (selectedBuyGroup !== 'all') {
                                                const group = getBuyGroupLabel(row.buyGroup);
                                                if (selectedBuyGroup === 'NBS' && group !== 'NBS') return false;
                                                if (selectedBuyGroup === 'Sports Inc' && group !== 'Sports Inc') return false;
                                                if (selectedBuyGroup === 'Non-Buy Group' && group !== 'Non-Buy Group') return false;
                                            }
                                            if (selectedCustomer !== 'all' && row.customer !== selectedCustomer) return false;
                                            return true;
                                        };
                                        
                                        if (selectedYear === 'all') {
                                            // Cumulative new accounts across all years
                                            const allNewAccounts = { NBS: new Set(), 'Sports Inc': new Set(), 'Non-Buy Group': new Set() };
                                            const allYears = [...new Set(rawData.filter(r => r.shipDateParsed && matchesNonYearFilters(r)).map(r => r.shipDateParsed.getFullYear()))].sort();
                                            
                                            allYears.forEach((year, index) => {
                                                if (index === 0) return; // Skip first year
                                                
                                                const previousYear = allYears[index - 1];
                                                const currentYearAccounts = { NBS: new Set(), 'Sports Inc': new Set(), 'Non-Buy Group': new Set() };
                                                const previousYearAccounts = { NBS: new Set(), 'Sports Inc': new Set(), 'Non-Buy Group': new Set() };
                                                
                                                rawData.forEach(row => {
                                                    if (!row.shipDateParsed || !row.customer || !matchesNonYearFilters(row)) return;
                                                    const rowYear = row.shipDateParsed.getFullYear();
                                                    const group = getBuyGroupLabel(row.buyGroup);
                                                    
                                                    if (rowYear === year) {
                                                        currentYearAccounts[group].add(row.customer);
                                                    } else if (rowYear === previousYear) {
                                                        previousYearAccounts[group].add(row.customer);
                                                    }
                                                });
                                                
                                                ['NBS', 'Sports Inc', 'Non-Buy Group'].forEach(group => {
                                                    currentYearAccounts[group].forEach(customer => {
                                                        if (!previousYearAccounts[group].has(customer)) {
                                                            allNewAccounts[group].add(customer);
                                                        }
                                                    });
                                                });
                                            });
                                            
                                            const result = {
                                                NBS: allNewAccounts['NBS'].size,
                                                'Sports Inc': allNewAccounts['Sports Inc'].size
                                            };
                                            
                                            if (showNonBuyGroup) {
                                                result['Non-Buy Group'] = allNewAccounts['Non-Buy Group'].size;
                                            }
                                            
                                            return result;
                                        } else {
                                            // New accounts for selected year only
                                            const currentYear = parseInt(selectedYear);
                                            const previousYear = currentYear - 1;
                                            const currentYearAccounts = { NBS: new Set(), 'Sports Inc': new Set(), 'Non-Buy Group': new Set() };
                                            const previousYearAccounts = { NBS: new Set(), 'Sports Inc': new Set(), 'Non-Buy Group': new Set() };
                                            
                                            rawData.forEach(row => {
                                                if (!row.shipDateParsed || !row.customer || !matchesNonYearFilters(row)) return;
                                                const rowYear = row.shipDateParsed.getFullYear();
                                                const group = getBuyGroupLabel(row.buyGroup);
                                                
                                                if (rowYear === currentYear) {
                                                    currentYearAccounts[group].add(row.customer);
                                                } else if (rowYear === previousYear) {
                                                    previousYearAccounts[group].add(row.customer);
                                                }
                                            });
                                            
                                            const newAccounts = { NBS: 0, 'Sports Inc': 0, 'Non-Buy Group': 0 };
                                            ['NBS', 'Sports Inc', 'Non-Buy Group'].forEach(group => {
                                                currentYearAccounts[group].forEach(customer => {
                                                    if (!previousYearAccounts[group].has(customer)) {
                                                        newAccounts[group]++;
                                                    }
                                                });
                                            });
                                            
                                            const result = {
                                                NBS: newAccounts['NBS'],
                                                'Sports Inc': newAccounts['Sports Inc']
                                            };
                                            
                                            if (showNonBuyGroup) {
                                                result['Non-Buy Group'] = newAccounts['Non-Buy Group'];
                                            }
                                            
                                            return result;
                                        }
                                    })();

                                    return (
                                        <>
                                            {/* Grouped Bar Chart - Annual Revenue by Group */}
                                            <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold' }}>Annual Revenue by Buy Group</h2>
                                                <div className="chart-container">
                                                    <GroupedBarChart data={buyGroupRevenueData} title="Revenue Comparison" />
                                                </div>
                                            </div>

                                            {/* YoY Growth Section */}
                                            <div className="no-print" style={{ marginBottom: '20px' }}>
                                                <h2 style={{ color: '#e0e0e0', marginBottom: '15px', fontSize: '24px', fontWeight: 'bold' }}>Year-over-Year Growth</h2>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                                    {yoyGrowthData.map((item, index) => (
                                                        <div key={index} style={{ 
                                                            backgroundColor: '#f5f5f5', 
                                                            padding: '20px', 
                                                            borderRadius: '8px', 
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)', 
                                                            border: '1px solid #ddd' 
                                                        }}>
                                                            <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px' }}>{item.group}</h3>
                                                            <div style={{ marginBottom: '10px' }}>
                                                                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>Total Units</p>
                                                                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#23668b' }}>
                                                                    {item.currentUnits.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>YoY Growth</p>
                                                                <p style={{ 
                                                                    margin: 0, 
                                                                    fontSize: '24px', 
                                                                    fontWeight: 'bold', 
                                                                    color: item.growth >= 0 ? '#238b48' : '#8b2366' 
                                                                }}>
                                                                    {item.growth >= 0 ? '+' : ''}{item.growth.toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Total Accounts Section */}
                                            <div className="no-print" style={{ marginBottom: '20px' }}>
                                                <h2 style={{ color: '#e0e0e0', marginBottom: '15px', fontSize: '24px', fontWeight: 'bold' }}>Total Accounts by Group</h2>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                                    {Object.entries(accountsPerGroup).map(([group, count], index) => (
                                                        <div key={index} style={{ 
                                                            backgroundColor: '#f5f5f5', 
                                                            padding: '20px', 
                                                            borderRadius: '8px', 
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)', 
                                                            border: '1px solid #ddd',
                                                            textAlign: 'center'
                                                        }}>
                                                            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>{group}</h3>
                                                            <p style={{ margin: 0, fontSize: '48px', fontWeight: 'bold', color: '#23668b' }}>
                                                                {count}
                                                            </p>
                                                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>accounts</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* New Accounts Section */}
                                            <div className="no-print" style={{ marginBottom: '20px' }}>
                                                <h2 style={{ color: '#e0e0e0', marginBottom: '15px', fontSize: '24px', fontWeight: 'bold' }}>
                                                    New Accounts {selectedYear !== 'all' ? `(${selectedYear})` : '(Cumulative)'}
                                                </h2>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                                    {Object.entries(newAccountsData).map(([group, count], index) => (
                                                        <div key={index} style={{ 
                                                            backgroundColor: '#f5f5f5', 
                                                            padding: '20px', 
                                                            borderRadius: '8px', 
                                                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)', 
                                                            border: '1px solid #ddd',
                                                            textAlign: 'center'
                                                        }}>
                                                            <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px' }}>{group}</h3>
                                                            <p style={{ margin: 0, fontSize: '48px', fontWeight: 'bold', color: '#238b48' }}>
                                                                {count}
                                                            </p>
                                                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>new accounts</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                        </>
                                    );
                                })()}

                            </>
                        )}

                        {/* Product Deep Dive Page */}
                        {rawData.length > 0 && currentPage === 'productdeepdive' && (
                            <>
                                {/* Filters for Product Deep Dive */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Account Manager:
                                            </label>
                                            <select
                                                value={selectedAccountManager}
                                                onChange={(e) => setSelectedAccountManager(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {accountManagers.map(manager => (
                                                    <option key={manager} value={manager}>
                                                        {manager === 'all' ? 'All' : manager}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                H&G Rep:
                                            </label>
                                            <select
                                                value={selectedHGRep}
                                                onChange={(e) => setSelectedHGRep(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {hgReps.map(rep => (
                                                    <option key={rep} value={rep}>
                                                        {rep === 'all' ? 'All' : rep}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Territory:
                                            </label>
                                            <select
                                                value={selectedTerritory}
                                                onChange={(e) => setSelectedTerritory(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {territories.map(territory => (
                                                    <option key={territory} value={territory}>
                                                        {territory === 'all' ? 'All Territories' : territory}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Year:
                                            </label>
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {years.map(year => (
                                                    <option key={year} value={year}>
                                                        {year === 'all' ? 'All Years' : year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Classification:
                                            </label>
                                            <select
                                                value={selectedClassification}
                                                onChange={(e) => setSelectedClassification(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {classifications.map(classification => (
                                                    <option key={classification} value={classification}>
                                                        {classification === 'all' ? 'All Classifications' : classification}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Buy Group:
                                            </label>
                                            <select
                                                value={selectedBuyGroup}
                                                onChange={(e) => setSelectedBuyGroup(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {buyGroups.map(group => (
                                                    <option key={group} value={group}>
                                                        {group === 'all' ? 'All Groups' : group}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Customer:
                                            </label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {customers.map(customer => (
                                                    <option key={customer} value={customer}>
                                                        {customer === 'all' ? 'All Customers' : customer}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Quarterly Demand by Scope Family ── */}
                                {(() => {
                                    const FAMILY_COLORS = {
                                        ATACR: '#23668b',
                                        NX8:   '#238b48',
                                        NX6:   '#8b6623',
                                        SHV:   '#8b2366',
                                        NXS:   '#668b23',
                                        NF:    '#66238b'
                                    };
                                    const FAMILY_LABELS = {
                                        ATACR: 'ATACR Family',
                                        NX8:   'NX8 Family',
                                        NX6:   'NX6 Family',
                                        SHV:   'SHV Family',
                                        NXS:   'NXS Family',
                                        NF:    'NF / Competition'
                                    };
                                    const { result, years } = quarterlyDemandByFamily;

                                    if (!years || years.length === 0) return null;

                                    const activeYears = years.filter(yr => !hiddenQtrYears.has(yr));

                                    const toggleYear = (yr) => {
                                        setHiddenQtrYears(prev => {
                                            const next = new Set(prev);
                                            if (next.has(yr)) { next.delete(yr); } else { next.add(yr); }
                                            return next;
                                        });
                                    };

                                    return (
                                        <div style={{ marginBottom: '24px' }}>
                                            <div style={{ backgroundColor: '#23668b', padding: '14px 20px', borderRadius: '8px 8px 0 0' }}>
                                                <h2 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                                                    Quarterly Demand by Scope Family
                                                </h2>
                                                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>
                                                    Units ordered · Q1–Q4 grouped · Years compared side-by-side · Shipped (Request Date) + Open Orders (Ordered Date)
                                                </p>
                                            </div>
                                            <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 8px 8px', padding: '20px' }}>
                                                {/* Interactive year legend */}
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '12px', color: '#888', marginRight: '4px' }}>Toggle years:</span>
                                                    {years.map((yr, i) => {
                                                        const isHidden = hiddenQtrYears.has(yr);
                                                        const color = QTRLY_YEAR_COLORS[i % QTRLY_YEAR_COLORS.length];
                                                        return (
                                                            <span
                                                                key={yr}
                                                                onClick={() => toggleYear(yr)}
                                                                style={{
                                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                                    fontSize: '13px', cursor: 'pointer',
                                                                    color: isHidden ? '#bbb' : '#444',
                                                                    userSelect: 'none',
                                                                    padding: '4px 10px',
                                                                    borderRadius: '20px',
                                                                    border: `1px solid ${isHidden ? '#ddd' : color}`,
                                                                    backgroundColor: isHidden ? '#f0f0f0' : color + '14',
                                                                    transition: 'all 0.15s ease'
                                                                }}
                                                            >
                                                                <span style={{
                                                                    width: '10px', height: '10px', borderRadius: '2px',
                                                                    backgroundColor: isHidden ? '#ccc' : color,
                                                                    display: 'inline-block',
                                                                    transition: 'background-color 0.15s ease'
                                                                }}></span>
                                                                <span style={{ textDecoration: isHidden ? 'line-through' : 'none' }}>{yr}</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
                                                    {['ATACR','NX8','NX6','SHV','NXS','NF'].map(family => {
                                                        const fData = result[family];
                                                        return (
                                                            <div key={family} style={{ backgroundColor: '#fff', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                                    <h3 style={{ margin: 0, color: FAMILY_COLORS[family], fontSize: '16px', fontWeight: 'bold' }}>
                                                                        {FAMILY_LABELS[family]}
                                                                    </h3>
                                                                    <span style={{ backgroundColor: FAMILY_COLORS[family] + '18', color: FAMILY_COLORS[family], padding: '3px 10px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
                                                                        {fData.total.toLocaleString()} units
                                                                    </span>
                                                                </div>
                                                                <div style={{ height: '220px' }}>
                                                                    <FamilyQuarterlyChart
                                                                        yearData={fData.yearData}
                                                                        years={activeYears}
                                                                        familyName={FAMILY_LABELS[family]}
                                                                    />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {(() => {
                                    // Helper to determine scope family
                                    const getScopeFamily = (item) => {
                                        if (!item) return null;
                                        const itemUpper = item.trim().toUpperCase();
                                        
                                        if (itemUpper.startsWith('C')) {
                                            const description = filteredData.find(row => row.item === item)?.description?.toUpperCase() || '';
                                            
                                            if (description.includes('ATACR')) return 'ATACR';
                                            if (description.includes('NX8')) return 'NX8';
                                            if (description.includes('NX6')) return 'NX6';
                                            if (description.includes('SHV')) return 'SHV';
                                            if (description.includes('NXS')) return 'NXS';
                                            if (description.includes('COMP') || description.includes('COMPETITION')) return 'NF';
                                            
                                            return 'NF'; // Default for other C items
                                        }
                                        
                                        return null;
                                    };

                                    // Calculate All Optics Top 50/100 (combining shipped + unshipped)
                                    const allOpticsTop = (() => {
                                        const optics = {};
                                        
                                        // Process shipped data (respects all filters)
                                        if (allOpticsDataSource === 'shipped' || allOpticsDataSource === 'both') {
                                            filteredData.forEach(row => {
                                                const item = (row.item || '').trim().toUpperCase();
                                                if (!item || !item.startsWith('C')) return;
                                                
                                                const family = getScopeFamily(item);
                                                if (!family) return;
                                                
                                                // Apply scope family filter
                                                if (allOpticsScopeFamily !== 'all' && family !== allOpticsScopeFamily) return;
                                                
                                                if (!optics[item]) {
                                                    optics[item] = {
                                                        item,
                                                        description: row.description,
                                                        family,
                                                        shippedQty: 0,
                                                        unshippedQty: 0
                                                    };
                                                }
                                                optics[item].shippedQty += row.qty;
                                            });
                                        }
                                        
                                        // Process unshipped data (respects all filters)
                                        if (allOpticsDataSource === 'unshipped' || allOpticsDataSource === 'both') {
                                            let filteredUnshipped = unshippedData;
                                            
                                            // Apply same filters as shipped data
                                            if (selectedAccountManager !== 'all') {
                                                filteredUnshipped = filteredUnshipped.filter(row => row.accountManager === selectedAccountManager);
                                            }
                                            if (selectedHGRep !== 'all') {
                                                filteredUnshipped = filteredUnshipped.filter(row => row.hgSalesRep === selectedHGRep);
                                            }
                                            if (selectedTerritory !== 'all') {
                                                filteredUnshipped = filteredUnshipped.filter(row => row.territory === selectedTerritory);
                                            }
                                            if (selectedYear !== 'all') {
                                                const yearNum = parseInt(selectedYear);
                                                filteredUnshipped = filteredUnshipped.filter(row => {
                                                    if (!row.scheduledShipDateParsed) return false;
                                                    return row.scheduledShipDateParsed.getFullYear() === yearNum;
                                                });
                                            }
                                            if (selectedClassification !== 'all') {
                                                filteredUnshipped = filteredUnshipped.filter(row => row.classification === selectedClassification);
                                            }
                                            if (selectedBuyGroup !== 'all') {
                                                if (selectedBuyGroup === 'NBS') {
                                                    filteredUnshipped = filteredUnshipped.filter(row => row.buyGroup === 'NBS');
                                                } else if (selectedBuyGroup === 'Sports Inc') {
                                                    filteredUnshipped = filteredUnshipped.filter(row => row.buyGroup === 'SPORTS_INC');
                                                } else if (selectedBuyGroup === 'Non-Buy Group') {
                                                    filteredUnshipped = filteredUnshipped.filter(row => !row.buyGroup || row.buyGroup === '');
                                                }
                                            }
                                            if (selectedCustomer !== 'all') {
                                                filteredUnshipped = filteredUnshipped.filter(row => row.customer === selectedCustomer);
                                            }
                                            
                                            filteredUnshipped.forEach(row => {
                                                const item = (row.item || '').trim().toUpperCase();
                                                if (!item || !item.startsWith('C')) return;
                                                
                                                // Need to determine family from unshipped data too
                                                const description = (row.description || '').toUpperCase();
                                                let family = null;
                                                if (description.includes('ATACR')) family = 'ATACR';
                                                else if (description.includes('NX8')) family = 'NX8';
                                                else if (description.includes('NX6')) family = 'NX6';
                                                else if (description.includes('SHV')) family = 'SHV';
                                                else if (description.includes('NXS')) family = 'NXS';
                                                else if (description.includes('COMP') || description.includes('COMPETITION')) family = 'NF';
                                                else family = 'NF';
                                                
                                                if (!family) return;
                                                
                                                // Apply scope family filter
                                                if (allOpticsScopeFamily !== 'all' && family !== allOpticsScopeFamily) return;
                                                
                                                if (!optics[item]) {
                                                    optics[item] = {
                                                        item,
                                                        description: row.description,
                                                        family,
                                                        shippedQty: 0,
                                                        unshippedQty: 0
                                                    };
                                                }
                                                optics[item].unshippedQty += row.qty;
                                            });
                                        }
                                        
                                        // Calculate total qty and sort
                                        return Object.values(optics)
                                            .map(product => ({
                                                ...product,
                                                totalQty: product.shippedQty + product.unshippedQty
                                            }))
                                            .sort((a, b) => b.totalQty - a.totalQty)
                                            .slice(0, allOpticsTopN);
                                    })();

                                    // Calculate national rankings (shipped data only, filtered by Year, Classification, Territory)
                                    const nationalRankings = (() => {
                                        // Filter rawData by Year, Classification, Territory only
                                        let nationalFilteredData = rawData;
                                        
                                        if (selectedYear !== 'all') {
                                            const yearNum = parseInt(selectedYear);
                                            nationalFilteredData = nationalFilteredData.filter(row => {
                                                if (!row.shipDateParsed) return false;
                                                return row.shipDateParsed.getFullYear() === yearNum;
                                            });
                                        }
                                        
                                        if (selectedClassification !== 'all') {
                                            nationalFilteredData = nationalFilteredData.filter(row => row.classification === selectedClassification);
                                        }
                                        
                                        if (selectedTerritory !== 'all') {
                                            nationalFilteredData = nationalFilteredData.filter(row => row.territory === selectedTerritory);
                                        }
                                        
                                        // Build national quantities by family
                                        const families = {
                                            'ATACR': {},
                                            'NX8': {},
                                            'NX6': {},
                                            'SHV': {},
                                            'NXS': {},
                                            'NF': {}
                                        };
                                        
                                        nationalFilteredData.forEach(row => {
                                            const family = getScopeFamily(row.item);
                                            if (!family) return;
                                            
                                            if (!families[family][row.item]) {
                                                families[family][row.item] = 0;
                                            }
                                            families[family][row.item] += row.qty;
                                        });
                                        
                                        // Create rankings for each family
                                        const rankings = {};
                                        Object.keys(families).forEach(family => {
                                            const sorted = Object.entries(families[family])
                                                .sort(([, qtyA], [, qtyB]) => qtyB - qtyA);
                                            
                                            rankings[family] = {};
                                            sorted.forEach(([item, qty], index) => {
                                                rankings[family][item] = index + 1; // Rank starts at 1
                                            });
                                        });
                                        
                                        return rankings;
                                    })();

                                    // Calculate Top 20 per family with enhanced metrics
                                    const topProductsByFamily = (() => {
                                        const families = {
                                            'ATACR': {},
                                            'NX8': {},
                                            'NX6': {},
                                            'SHV': {},
                                            'NXS': {},
                                            'NF': {}
                                        };
                                        
                                        // Get current year and previous year for YoY calculation
                                        const allYears = [...new Set(rawData.filter(r => r.shipDateParsed).map(r => r.shipDateParsed.getFullYear()))].sort();
                                        const latestYear = allYears[allYears.length - 1];
                                        const previousYear = latestYear - 1;
                                        
                                        // Build product data with all metrics
                                        filteredData.forEach(row => {
                                            const family = getScopeFamily(row.item);
                                            if (!family) return;
                                            
                                            if (!families[family][row.item]) {
                                                families[family][row.item] = {
                                                    item: row.item,
                                                    description: row.description,
                                                    qty: 0,
                                                    currentYearQty: 0,
                                                    previousYearQty: 0,
                                                    customers: new Set(),
                                                    customerPurchases: {}, // Track how many times each customer bought
                                                    territoryQty: { East: 0, West: 0, Central: 0 }
                                                };
                                            }
                                            
                                            const product = families[family][row.item];
                                            product.qty += row.qty;
                                            
                                            // Track customers
                                            if (row.customer) {
                                                product.customers.add(row.customer);
                                                if (!product.customerPurchases[row.customer]) {
                                                    product.customerPurchases[row.customer] = 0;
                                                }
                                                product.customerPurchases[row.customer]++;
                                            }
                                            
                                            // Track territory
                                            if (row.territory && row.territory !== 'all') {
                                                product.territoryQty[row.territory] += row.qty;
                                            }
                                        });
                                        
                                        // Calculate YoY growth from rawData (to get previous year data)
                                        rawData.forEach(row => {
                                            const family = getScopeFamily(row.item);
                                            if (!family || !families[family][row.item]) return;
                                            
                                            if (!row.shipDateParsed) return;
                                            const year = row.shipDateParsed.getFullYear();
                                            
                                            if (year === latestYear) {
                                                families[family][row.item].currentYearQty += row.qty;
                                            } else if (year === previousYear) {
                                                families[family][row.item].previousYearQty += row.qty;
                                            }
                                        });
                                        
                                        // Calculate derived metrics and sort
                                        const result = {};
                                        Object.keys(families).forEach(family => {
                                            result[family] = Object.values(families[family]).map(product => {
                                                // YoY Growth %
                                                const yoyGrowth = product.previousYearQty === 0 
                                                    ? (product.currentYearQty > 0 ? 100 : 0)
                                                    : ((product.currentYearQty - product.previousYearQty) / product.previousYearQty) * 100;
                                                
                                                // Trend Indicator
                                                const uniqueCustomers = product.customers.size;
                                                
                                                // Repeat Purchase Rate
                                                const repeatCustomers = Object.values(product.customerPurchases).filter(count => count > 1).length;
                                                const repeatRate = uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;
                                                
                                                // Territory Leader (which territory buys most)
                                                const territories = product.territoryQty;
                                                let topTerritory = 'None';
                                                let maxQty = 0;
                                                Object.entries(territories).forEach(([territory, qty]) => {
                                                    if (qty > maxQty) {
                                                        maxQty = qty;
                                                        topTerritory = territory;
                                                    }
                                                });
                                                
                                                // Get national rank for this product
                                                const nationalRank = nationalRankings[family][product.item] || null;
                                                
                                                return {
                                                    ...product,
                                                    customers: uniqueCustomers,
                                                    repeatRate,
                                                    yoyGrowth,
                                                    topTerritory,
                                                    eastQty: territories.East,
                                                    westQty: territories.West,
                                                    centralQty: territories.Central,
                                                    nationalRank: nationalRank
                                                };
                                            })
                                            .sort((a, b) => b.qty - a.qty)
                                            .slice(0, 20);
                                        });
                                        
                                        return result;
                                    })();

                                    // === Export: All Optics section to Excel ===
                                    const exportAllOpticsXLSX = () => {
                                        const sourceLabel = allOpticsDataSource === 'both' ? 'Shipped + Unshipped' : allOpticsDataSource === 'shipped' ? 'Shipped Only' : 'Unshipped Only';
                                        const familyLabel = allOpticsScopeFamily !== 'all' ? ' \u2014 ' + allOpticsScopeFamily + ' only' : '';
                                        const aoa = [
                                            ['All Optics - Top ' + allOpticsTopN + familyLabel],
                                            [allOpticsTop.length + ' items \u00b7 Data source: ' + sourceLabel],
                                            [],
                                            ['Rank', 'Item', 'Description', 'Family', 'Shipped Qty', 'Unshipped Qty', 'Total Qty'],
                                            ...allOpticsTop.map((p, i) => [i + 1, p.item, p.description, p.family, p.shippedQty, p.unshippedQty, p.totalQty]),
                                        ];
                                        const ws = XLSX.utils.aoa_to_sheet(aoa);
                                        ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 40 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 12 }];
                                        const wb = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(wb, ws, 'All Optics');
                                        XLSX.writeFile(wb, 'All_Optics_Top' + allOpticsTopN + '.xlsx');
                                    };

                                    // === Export: any Scope Family section (ATACR, NX8, NX6, SHV, NXS, NF) to Excel ===
                                    const exportFamilyXLSX = (familyKey, familyLabel) => {
                                        const rows = topProductsByFamily[familyKey] || [];
                                        const aoa = [
                                            [familyLabel + ' - Top 20'],
                                            [rows.length + ' products'],
                                            [],
                                            ['Rank', 'National Rank', 'Item', 'Description'],
                                            ...rows.map((p, i) => [i + 1, p.nationalRank ? ('#' + p.nationalRank) : 'N/A', p.item, p.description]),
                                        ];
                                        const ws = XLSX.utils.aoa_to_sheet(aoa);
                                        ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 50 }];
                                        const wb = XLSX.utils.book_new();
                                        XLSX.utils.book_append_sheet(wb, ws, familyLabel.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 31));
                                        const safe = familyLabel.replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
                                        XLSX.writeFile(wb, safe + '_Top20.xlsx');
                                    };

                                    return (
                                        <>
                                            {/* All Optics Top 50/100 Section */}
                                            <div id="all-optics-section" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '30px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                                                    <h2 style={{ margin: 0, color: '#333', fontSize: '24px', fontWeight: 'bold' }}>All Optics - Top {allOpticsTopN}</h2>
                                                    <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => printSection('all-optics-section')} style={{ padding: '8px 16px', backgroundColor: '#238b48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Print to PDF</button>
                                                        <button onClick={exportAllOpticsXLSX} style={{ padding: '8px 16px', backgroundColor: '#1a7a3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Download Excel</button>
                                                    </div>
                                                </div>
                                                
                                                {/* Filters for All Optics Section */}
                                                <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '6px' }}>
                                                    <div>
                                                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                            Show Top:
                                                        </label>
                                                        <select
                                                            value={allOpticsTopN}
                                                            onChange={(e) => setAllOpticsTopN(parseInt(e.target.value))}
                                                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                                        >
                                                            <option value={50}>Top 50</option>
                                                            <option value={100}>Top 100</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                            Scope Family:
                                                        </label>
                                                        <select
                                                            value={allOpticsScopeFamily}
                                                            onChange={(e) => setAllOpticsScopeFamily(e.target.value)}
                                                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                                        >
                                                            <option value="all">All Families</option>
                                                            <option value="ATACR">ATACR</option>
                                                            <option value="NX8">NX8</option>
                                                            <option value="NX6">NX6</option>
                                                            <option value="SHV">SHV</option>
                                                            <option value="NXS">NXS</option>
                                                            <option value="NF">NF</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                            Data Source:
                                                        </label>
                                                        <select
                                                            value={allOpticsDataSource}
                                                            onChange={(e) => setAllOpticsDataSource(e.target.value)}
                                                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                                        >
                                                            <option value="both">Shipped + Unshipped</option>
                                                            <option value="shipped">Shipped Only</option>
                                                            <option value="unshipped">Unshipped Only</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                
                                                {/* All Optics Table */}
                                                <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>Family</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Shipped Qty</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Unshipped Qty</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Total Qty</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {allOpticsTop.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No optics found matching current filters
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                allOpticsTop.map((product, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{product.item}</td>
                                                                        <td style={{ padding: '10px', color: '#666' }}>{product.description}</td>
                                                                        <td style={{ padding: '10px', color: '#23668b', textAlign: 'center', fontWeight: 'bold' }}>{product.family}</td>
                                                                        <td style={{ padding: '10px', color: '#238b48', textAlign: 'right', fontWeight: 'bold' }}>{product.shippedQty.toLocaleString()}</td>
                                                                        <td style={{ padding: '10px', color: '#8b6623', textAlign: 'right', fontWeight: 'bold' }}>{product.unshippedQty.toLocaleString()}</td>
                                                                        <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>{product.totalQty.toLocaleString()}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* ATACR Family */}
                                            <div id="atacr-family-section" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                                    <h2 style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: 'bold' }}>ATACR Family - Top 20</h2>
                                                    <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => printSection('atacr-family-section')} style={{ padding: '8px 16px', backgroundColor: '#238b48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Print to PDF</button>
                                                        <button onClick={() => exportFamilyXLSX('ATACR', 'ATACR Family')} style={{ padding: '8px 16px', backgroundColor: '#1a7a3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Download Excel</button>
                                                    </div>
                                                </div>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>National Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Qty</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Customers</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Repeat %</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topProductsByFamily['ATACR'].length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No ATACR products found
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                topProductsByFamily['ATACR'].map((product, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#238b48', textAlign: 'center', fontWeight: 'bold' }}>
                                                                            {product.nationalRank ? `#${product.nationalRank}` : 'N/A'}
                                                                        </td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{product.item}</td>
                                                                        <td style={{ padding: '10px', color: '#666' }}>{product.description}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{product.qty.toLocaleString()}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{product.customers}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{product.repeatRate.toFixed(0)}%</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* NX8 Family */}
                                            <div id="nx8-family-section" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                                    <h2 style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: 'bold' }}>NX8 Family - Top 20</h2>
                                                    <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => printSection('nx8-family-section')} style={{ padding: '8px 16px', backgroundColor: '#238b48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Print to PDF</button>
                                                        <button onClick={() => exportFamilyXLSX('NX8', 'NX8 Family')} style={{ padding: '8px 16px', backgroundColor: '#1a7a3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Download Excel</button>
                                                    </div>
                                                </div>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>National Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Qty</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Customers</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Repeat %</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topProductsByFamily['NX8'].length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No NX8 products found
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                topProductsByFamily['NX8'].map((product, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#238b48', textAlign: 'center', fontWeight: 'bold' }}>
                                                                            {product.nationalRank ? `#${product.nationalRank}` : 'N/A'}
                                                                        </td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{product.item}</td>
                                                                        <td style={{ padding: '10px', color: '#666' }}>{product.description}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{product.qty.toLocaleString()}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{product.customers}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{product.repeatRate.toFixed(0)}%</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* NX6 Family */}
                                            <div id="nx6-family-section" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                                    <h2 style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: 'bold' }}>NX6 Family - Top 20</h2>
                                                    <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => printSection('nx6-family-section')} style={{ padding: '8px 16px', backgroundColor: '#238b48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Print to PDF</button>
                                                        <button onClick={() => exportFamilyXLSX('NX6', 'NX6 Family')} style={{ padding: '8px 16px', backgroundColor: '#1a7a3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Download Excel</button>
                                                    </div>
                                                </div>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>National Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Qty</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Customers</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Repeat %</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topProductsByFamily['NX6'].length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No NX6 products found
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                topProductsByFamily['NX6'].map((product, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#238b48', textAlign: 'center', fontWeight: 'bold' }}>
                                                                            {product.nationalRank ? `#${product.nationalRank}` : 'N/A'}
                                                                        </td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{product.item}</td>
                                                                        <td style={{ padding: '10px', color: '#666' }}>{product.description}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{product.qty.toLocaleString()}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{product.customers}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{product.repeatRate.toFixed(0)}%</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* SHV Family */}
                                            <div id="shv-family-section" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                                    <h2 style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: 'bold' }}>SHV Family - Top 20</h2>
                                                    <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => printSection('shv-family-section')} style={{ padding: '8px 16px', backgroundColor: '#238b48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Print to PDF</button>
                                                        <button onClick={() => exportFamilyXLSX('SHV', 'SHV Family')} style={{ padding: '8px 16px', backgroundColor: '#1a7a3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Download Excel</button>
                                                    </div>
                                                </div>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>National Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Qty</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Customers</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Repeat %</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topProductsByFamily['SHV'].length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No SHV products found
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                topProductsByFamily['SHV'].map((product, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#238b48', textAlign: 'center', fontWeight: 'bold' }}>
                                                                            {product.nationalRank ? `#${product.nationalRank}` : 'N/A'}
                                                                        </td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{product.item}</td>
                                                                        <td style={{ padding: '10px', color: '#666' }}>{product.description}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{product.qty.toLocaleString()}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{product.customers}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{product.repeatRate.toFixed(0)}%</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* NXS Family */}
                                            <div id="nxs-family-section" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                                    <h2 style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: 'bold' }}>NXS Family - Top 20</h2>
                                                    <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => printSection('nxs-family-section')} style={{ padding: '8px 16px', backgroundColor: '#238b48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Print to PDF</button>
                                                        <button onClick={() => exportFamilyXLSX('NXS', 'NXS Family')} style={{ padding: '8px 16px', backgroundColor: '#1a7a3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Download Excel</button>
                                                    </div>
                                                </div>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>National Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Qty</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Customers</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Repeat %</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topProductsByFamily['NXS'].length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No NXS products found
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                topProductsByFamily['NXS'].map((product, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#238b48', textAlign: 'center', fontWeight: 'bold' }}>
                                                                            {product.nationalRank ? `#${product.nationalRank}` : 'N/A'}
                                                                        </td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{product.item}</td>
                                                                        <td style={{ padding: '10px', color: '#666' }}>{product.description}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{product.qty.toLocaleString()}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{product.customers}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{product.repeatRate.toFixed(0)}%</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* NF Family (Competition + Other) */}
                                            <div id="nf-family-section" className="print-card" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
                                                    <h2 style={{ margin: 0, color: '#333', fontSize: '22px', fontWeight: 'bold' }}>NF Family (Competition + Other) - Top 20</h2>
                                                    <div className="no-print" style={{ display: 'flex', gap: '10px' }}>
                                                        <button onClick={() => printSection('nf-family-section')} style={{ padding: '8px 16px', backgroundColor: '#238b48', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Print to PDF</button>
                                                        <button onClick={() => exportFamilyXLSX('NF', 'NF Family')} style={{ padding: '8px 16px', backgroundColor: '#1a7a3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Download Excel</button>
                                                    </div>
                                                </div>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>National Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Qty</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Customers</th>
                                                                <th className="no-print" style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Repeat %</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {topProductsByFamily['NF'].length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No NF products found
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                topProductsByFamily['NF'].map((product, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#238b48', textAlign: 'center', fontWeight: 'bold' }}>
                                                                            {product.nationalRank ? `#${product.nationalRank}` : 'N/A'}
                                                                        </td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{product.item}</td>
                                                                        <td style={{ padding: '10px', color: '#666' }}>{product.description}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{product.qty.toLocaleString()}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{product.customers}</td>
                                                                        <td className="no-print" style={{ padding: '10px', color: '#23668b', textAlign: 'right', fontWeight: 'bold' }}>{product.repeatRate.toFixed(0)}%</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}

                            </>
                        )}

                        {/* Open Orders Report Page */}
                        {unshippedData.length > 0 && currentPage === 'openorders' && (
                            <>
                                {/* === Open Orders sub-navigation === */}
                                <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                                    <button onClick={() => setOoView('summary')} style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: ooView === 'summary' ? '#23668b' : '#ccc', color: ooView === 'summary' ? '#fff' : '#333' }}>Unshipped Summary</button>
                                    <button onClick={() => setOoView('report')} style={{ padding: '10px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: ooView === 'report' ? '#23668b' : '#ccc', color: ooView === 'report' ? '#fff' : '#333' }}>Open Order Report</button>
                                </div>

                                {ooView === 'summary' && (<>
                                {/* Filters for Open Orders */}
                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                                        {/* Account Manager Filter - First */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Account Manager:
                                            </label>
                                            <select
                                                value={selectedAccountManager}
                                                onChange={(e) => setSelectedAccountManager(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {(() => {
                                                    const managers = ['all', ...new Set(unshippedData.map(row => row.accountManager).filter(m => m))].sort();
                                                    return managers.map(manager => (
                                                        <option key={manager} value={manager}>
                                                            {manager === 'all' ? 'All Account Managers' : manager}
                                                        </option>
                                                    ));
                                                })()}
                                            </select>
                                        </div>
                                        
                                        {/* H&G Rep Filter - Second */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                H&G Rep:
                                            </label>
                                            <select
                                                value={selectedHGRep}
                                                onChange={(e) => setSelectedHGRep(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {(() => {
                                                    // Filter reps based on selected Account Manager
                                                    let dataToFilter = unshippedData;
                                                    if (selectedAccountManager !== 'all') {
                                                        dataToFilter = unshippedData.filter(row => row.accountManager === selectedAccountManager);
                                                    }
                                                    const reps = ['all', ...new Set(dataToFilter.map(row => row.hgSalesRep).filter(r => r))].sort();
                                                    return reps.map(rep => (
                                                        <option key={rep} value={rep}>
                                                            {rep === 'all' ? 'All H&G Reps' : rep}
                                                        </option>
                                                    ));
                                                })()}
                                            </select>
                                        </div>
                                        
                                        {/* Customer Filter - Third (cascades from Account Manager and H&G Rep) */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Customer:
                                            </label>
                                            <select
                                                value={selectedCustomer}
                                                onChange={(e) => setSelectedCustomer(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {(() => {
                                                    // Filter customers based on selected Account Manager and H&G Rep
                                                    let dataToFilter = unshippedData;
                                                    if (selectedAccountManager !== 'all') {
                                                        dataToFilter = dataToFilter.filter(row => row.accountManager === selectedAccountManager);
                                                    }
                                                    if (selectedHGRep !== 'all') {
                                                        dataToFilter = dataToFilter.filter(row => row.hgSalesRep === selectedHGRep);
                                                    }
                                                    const customers = ['all', ...new Set(dataToFilter.map(row => row.customer).filter(c => c))].sort();
                                                    return customers.map(customer => (
                                                        <option key={customer} value={customer}>
                                                            {customer === 'all' ? 'All Customers' : customer}
                                                        </option>
                                                    ));
                                                })()}
                                            </select>
                                        </div>
                                        
                                        {/* Buy Group Filter - Fourth */}
                                        <div>
                                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>
                                                Buy Group:
                                            </label>
                                            <select
                                                value={selectedBuyGroup}
                                                onChange={(e) => setSelectedBuyGroup(e.target.value)}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}
                                            >
                                                {['all', 'NBS', 'Sports Inc', 'Non-Buy Group'].map(group => (
                                                    <option key={group} value={group}>
                                                        {group === 'all' ? 'All Groups' : group}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {(() => {
                                    // Filter unshipped data
                                    let filteredUnshipped = unshippedData;
                                    
                                    if (selectedCustomer !== 'all') {
                                        filteredUnshipped = filteredUnshipped.filter(row => row.customer === selectedCustomer);
                                    }
                                    if (selectedHGRep !== 'all') {
                                        filteredUnshipped = filteredUnshipped.filter(row => row.hgSalesRep === selectedHGRep);
                                    }
                                    if (selectedAccountManager !== 'all') {
                                        filteredUnshipped = filteredUnshipped.filter(row => row.accountManager === selectedAccountManager);
                                    }
                                    if (selectedBuyGroup !== 'all') {
                                        if (selectedBuyGroup === 'NBS') {
                                            filteredUnshipped = filteredUnshipped.filter(row => row.buyGroup === 'NBS');
                                        } else if (selectedBuyGroup === 'Sports Inc') {
                                            filteredUnshipped = filteredUnshipped.filter(row => row.buyGroup === 'SPORTS_INC');
                                        } else if (selectedBuyGroup === 'Non-Buy Group') {
                                            filteredUnshipped = filteredUnshipped.filter(row => !row.buyGroup || row.buyGroup === '');
                                        }
                                    }

                                    // Calculate KPIs
                                    const totalOpenOrderValue = filteredUnshipped.reduce((sum, row) => sum + row.total, 0);
                                    const totalOpenOrders = new Set(filteredUnshipped.map(row => row.orderNumber).filter(o => o)).size;
                                    const totalOpenUnits = filteredUnshipped.reduce((sum, row) => sum + row.qty, 0);
                                    
                                    // Calculate average days to ship
                                    const today = new Date();
                                    const daysToShip = filteredUnshipped
                                        .filter(row => row.orderedDateParsed && row.scheduledShipDateParsed)
                                        .map(row => {
                                            const diff = row.scheduledShipDateParsed - row.orderedDateParsed;
                                            return Math.floor(diff / (1000 * 60 * 60 * 24));
                                        });
                                    const avgDaysToShip = daysToShip.length > 0 
                                        ? daysToShip.reduce((sum, days) => sum + days, 0) / daysToShip.length 
                                        : 0;

                                    // Backorders by Account
                                    const backordersByAccount = (() => {
                                        const grouped = {};
                                        filteredUnshipped.forEach(row => {
                                            const customer = row.customer || 'Unknown';
                                            if (!grouped[customer]) {
                                                grouped[customer] = {
                                                    customer,
                                                    totalValue: 0,
                                                    orderCount: new Set(),
                                                    units: 0
                                                };
                                            }
                                            grouped[customer].totalValue += row.total;
                                            grouped[customer].orderCount.add(row.orderNumber);
                                            grouped[customer].units += row.qty;
                                        });
                                        
                                        return Object.values(grouped)
                                            .map(item => ({
                                                ...item,
                                                orderCount: item.orderCount.size
                                            }))
                                            .sort((a, b) => b.totalValue - a.totalValue);
                                    })();

                                    // Backorders by Item
                                    const backordersByItem = (() => {
                                        const grouped = {};
                                        filteredUnshipped.forEach(row => {
                                            const item = row.item || 'Unknown';
                                            if (!grouped[item]) {
                                                grouped[item] = {
                                                    item,
                                                    description: row.description,
                                                    qty: 0,
                                                    value: 0,
                                                    earliestShipDate: null
                                                };
                                            }
                                            grouped[item].qty += row.qty;
                                            grouped[item].value += row.total;
                                            
                                            // Track earliest scheduled ship date
                                            if (row.scheduledShipDateParsed) {
                                                if (!grouped[item].earliestShipDate || row.scheduledShipDateParsed < grouped[item].earliestShipDate) {
                                                    grouped[item].earliestShipDate = row.scheduledShipDateParsed;
                                                }
                                            }
                                        });
                                        
                                        return Object.values(grouped)
                                            .sort((a, b) => b.qty - a.qty)
                                            .slice(0, 50);
                                    })();

                                    return (
                                        <>
                                            {/* KPI Cards */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Open Order Value</h3>
                                                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#23668b' }}>
                                                        {formatCurrency(totalOpenOrderValue)}
                                                    </p>
                                                </div>
                                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Number of Open Orders</h3>
                                                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#238b48' }}>
                                                        {formatNumber(totalOpenOrders)}
                                                    </p>
                                                </div>
                                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Total Open Units</h3>
                                                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#8b6623' }}>
                                                        {formatNumber(totalOpenUnits)}
                                                    </p>
                                                </div>
                                                <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                    <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>Avg Days to Ship</h3>
                                                    <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#8b2366' }}>
                                                        {avgDaysToShip.toFixed(0)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Backorders by Account */}
                                            <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Backorders by Account</h2>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Customer</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Total Value</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Orders</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Units</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {backordersByAccount.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                                                        No open orders
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                backordersByAccount.map((item, index) => (
                                                                    <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                        <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                        <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{item.customer}</td>
                                                                        <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(item.totalValue)}</td>
                                                                        <td style={{ padding: '10px', color: '#666', textAlign: 'right' }}>{item.orderCount}</td>
                                                                        <td style={{ padding: '10px', color: '#666', textAlign: 'right' }}>{formatNumber(item.units)}</td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Top 20 Backordered Items */}
                                            <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Top 20 Backordered Items</h2>
                                                <div style={{ height: '500px' }}>
                                                    <HorizontalBarChart 
                                                        data={backordersByItem.map(item => ({ item: item.item, qty: item.qty }))} 
                                                        title="Top Backordered Items" 
                                                    />
                                                </div>
                                            </div>

                                            {/* Top 50 Backordered Items - Detail Table */}
                                            <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Top 50 Backordered Items - Detail</h2>
                                                <div className="detail-table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f5f5f5' }}>
                                                            <tr>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Rank</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Item</th>
                                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #23668b', color: '#333' }}>Description</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Qty</th>
                                                                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #23668b', color: '#333' }}>Scheduled Ship Date</th>
                                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '2px solid #23668b', color: '#333' }}>Total Value</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {backordersByItem.map((item, index) => (
                                                                <tr key={index} style={{ borderBottom: '1px solid #e0e0e0' }}>
                                                                    <td style={{ padding: '10px', color: '#23668b', fontWeight: 'bold' }}>#{index + 1}</td>
                                                                    <td style={{ padding: '10px', color: '#333', fontWeight: 'bold' }}>{item.item}</td>
                                                                    <td style={{ padding: '10px', color: '#666' }}>{item.description}</td>
                                                                    <td style={{ padding: '10px', color: '#333', textAlign: 'right', fontWeight: 'bold' }}>{formatNumber(item.qty)}</td>
                                                                    <td style={{ padding: '10px', color: '#666', textAlign: 'center' }}>
                                                                        {item.earliestShipDate ? item.earliestShipDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                                    </td>
                                                                    <td style={{ padding: '10px', color: '#333', textAlign: 'right' }}>{formatCurrency(item.value)}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                                </>)}

                                {ooView === 'report' && (
                                    <>
                                        {/* Report controls */}
                                        <div className="no-print" style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd', display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'flex-end' }}>
                                            <div>
                                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>Report By:</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => setOoMode('rep')} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: ooMode === 'rep' ? '#23668b' : '#ddd', color: ooMode === 'rep' ? '#fff' : '#333' }}>Rep</button>
                                                    <button onClick={() => setOoMode('dealer')} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: ooMode === 'dealer' ? '#23668b' : '#ddd', color: ooMode === 'dealer' ? '#fff' : '#333' }}>Dealer</button>
                                                </div>
                                            </div>
                                            <div style={{ minWidth: '280px', flex: '1 1 280px' }}>
                                                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>{ooMode === 'rep' ? 'H&G Rep:' : 'Dealer:'}</label>
                                                <select value={ooMode === 'rep' ? ooRep : ooDealer} onChange={(e) => ooMode === 'rep' ? setOoRep(e.target.value) : setOoDealer(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', backgroundColor: '#fff', color: '#333', borderRadius: '4px' }}>
                                                    <option value="">{ooMode === 'rep' ? 'Select a rep\u2026' : 'Select a dealer\u2026'}</option>
                                                    {(() => {
                                                        const field = ooMode === 'rep' ? 'hgSalesRep' : 'customer';
                                                        const opts = [...new Set(unshippedData.map(r => r[field]).filter(Boolean))].sort();
                                                        return opts.map(o => <option key={o} value={o}>{o}</option>);
                                                    })()}
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={handlePrint} style={{ padding: '10px 18px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#555', color: '#fff' }}>Print</button>
                                                <button onClick={exportOpenOrderXLSX} style={{ padding: '10px 18px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#1a7a3c', color: '#fff' }}>Download Excel</button>
                                            </div>
                                        </div>

                                        {/* Report output */}
                                        {(() => {
                                            const sel = ooMode === 'rep' ? ooRep : ooDealer;
                                            if (!sel) {
                                                return <div style={{ padding: '40px', textAlign: 'center', color: '#888', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>Select a {ooMode === 'rep' ? 'rep' : 'dealer'} to generate the open order report.</div>;
                                            }
                                            const { rows, totals } = buildOpenOrderReport(unshippedData, ooMode, sel);
                                            if (rows.length === 0) {
                                                return <div style={{ padding: '40px', textAlign: 'center', color: '#888', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>No open orders found for {sel}.</div>;
                                            }
                                            const th = { padding: '8px 10px', textAlign: 'left', fontSize: '13px' };
                                            const td = { padding: '6px 10px', fontSize: '13px', borderBottom: '1px solid #eee', verticalAlign: 'top' };
                                            return (
                                                <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)', border: '1px solid #ddd' }}>
                                                    <h2 style={{ margin: '0 0 4px', color: '#23668b' }}>Open Order Report {'\u2014'} {ooMode === 'rep' ? 'Rep' : 'Dealer'}: {sel}</h2>
                                                    <div style={{ color: '#555', marginBottom: '18px', fontWeight: 'bold' }}>{totals.dealers} dealers {'\u00b7'} {totals.lines} order lines {'\u00b7'} {totals.units} units</div>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead>
                                                            <tr style={{ backgroundColor: '#23668b', color: '#fff' }}>
                                                                <th style={th}>Dealer</th>
                                                                <th style={th}>Location</th>
                                                                <th style={th}>SKU</th>
                                                                <th style={th}>Description</th>
                                                                <th style={{ ...th, textAlign: 'right' }}>Qty</th>
                                                                <th style={th}>Est. Delivery</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rows.map((r, i) => (
                                                                <tr key={i} style={{ backgroundColor: i % 2 ? '#f9f9f9' : '#fff' }}>
                                                                    <td style={td}>{r.dealer}</td>
                                                                    <td style={td}>{r.location}</td>
                                                                    <td style={td}>{r.sku}</td>
                                                                    <td style={td}>{r.description}</td>
                                                                    <td style={{ ...td, textAlign: 'right' }}>{r.qty}</td>
                                                                    <td style={td}>{r.deliveryDate}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })()}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            );
        };


export { ErrorBoundary, SalesDashboard };
