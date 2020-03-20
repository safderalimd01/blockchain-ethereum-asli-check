import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import products from './qrData.json';
import { MyCommandCell } from './actioneditbutton.js';
import { MyCommandCell2 } from './actionViewButton.js';
import { filterBy } from '@progress/kendo-data-query';
import { Input } from '@progress/kendo-react-inputs';
import MyInventoryAnchorTag from './GridAnchorTag.js';
import { formatDate } from '@telerik/kendo-intl';
import '../../../css/qrHashGrid.css';
import { Link } from "react-router-dom";
import BreadCrum from './../../layouts/breadcrum.js';  

products.forEach(o => {    o.orderDate = formatDate(new Date(o.orderDate), { date: "long" });
    o.expiryDate = formatDate(new Date(o.expiryDate), { date: "long" });
    o.shippedDate = o.shippedDate === 'NULL' ? undefined : new Date(o.shippedDate);
});

class QRHashGrid extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.createState(0, 10);
        this.state.searchButton= false;
        this.pageChange = this.pageChange.bind(this);
        this.state.apartments_data = [];
        this.state.tenant = false;
        if(this.props.location.pathname === "/all-apartment/grid"){
            this.state.apartment = "All Apartments";
        }else{
            this.state.apartment = "QR Grid";
        }
        if(this.props.location.pathname === "/tenant/apartment/grid"){
            this.state.tenant = true;
            for (let i = 0; i <= products.length; i++) {
                if(products[i] !== undefined){
                    if(products[i]['ProductID'].toString() === this.props.location.search.slice(4)){
                        this.state.buildingName = products[i]['ProductName']
                    }
                }
            }
        }
        
    }
    
    lastSelectedIndex = 0;
    CommandCell;
    AnchorTag;
    _export;
    export = () => {
        this._export.save();
    }
    AnchorTag = MyInventoryAnchorTag("inEdit");
    createState(skip, take) {
        return {
            data: products.map(dataItem => Object.assign({ selected: false }, dataItem)),
            total: products.length,
            skip: skip,
            pageSize: take,
            take:take,
            pageable: {
                buttonCount: 0,
                info: true,
                type: 'numeric',
                pageSizes: true,
                previousNext: true
            }
        };
    }
    
    state = {
        skip: 0, take: 10,
        sort: [
            { field: '', dir: 'asc' }
        ],
        search: false,
        deleteButton: false,
        tenant: this.props,
        count: 0,
        flagdisabled: ""
    }
    
    pageChange(event) {
        this.setState(this.createState(event.page.skip, event.page.take));
    }

    
    CommandCell = MyCommandCell({
        editField: this.editField,
        tenant:this.props
    });
    CommandCell2 = MyCommandCell2({
        editField: this.editField,
        tenant:this.props
    });
    
    selectionChange = (event) => {
        event.dataItem.selected = !event.dataItem.selected;
        this.forceUpdate();
        const countingData = []
        for (let i = 0; i <= this.state.data.length; i++) {
            if (this.state.data[i] !== undefined) {
                if (this.state.data[i]['selected'] === true) {
                    countingData.push(this.state.data[i])
                }
            }
        }
        var counting = countingData.length;
        if (counting !== 0) {
            this.setState({
                deleteButton: true,
                count: countingData.length
            })
        } else {
            this.setState({
                deleteButton: false,
                count: 0
            })
        }
    }

    rowClick = (event) => {
        let last = this.lastSelectedIndex;
        const current = this.state.data.findIndex(dataItem => dataItem === event.dataItem);
        
        if (!event.nativeEvent.shiftKey) {
            this.lastSelectedIndex = last = current;
        }

        if (!event.nativeEvent.ctrlKey) {
            this.state.data.forEach(item => item.selected = false);
        }
        const select = !event.dataItem.selected;
        for (let i = Math.min(last, current); i <= Math.max(last, current); i++) {
            const productData = this.state.data[i]
            productData.selected = select;
        }
        this.forceUpdate();
    }

    enterEdit = (dataItem) => {
        this.setState({
            data: this.state.data.map(item =>
                item._id === dataItem._id ?
                    { ...item, inEdit: true } : item
            )
        });
    }

    headerSelectionChange = (event) => {
        const checked = event.syntheticEvent.target.checked;

        if (checked === true) {
            this.setState({
                deleteButton: true,
                count: this.state.data.length
            })
        } else {
            this.setState({
                deleteButton: false,
                count: 0
            })
        }
        this.state.data.forEach(item => item.selected = checked);
        this.forceUpdate();
    }

    handleChange = (event) => {
        this.setState({
            data: filterBy(this.state.data.map(dataItem => Object.assign({ selected: false }, dataItem)), {
                logic: "or",
                filters: [{ field: "apartment_name", operator: "contains", value: event.target.value },
                { field: "street", operator: "contains", value: event.target.value },
                { field: "locality", operator: "contains", value: event.target.value },
                { field: "orderDate", operator: "contains", value: event.target.value },
                { field: "Opened_units", operator: "contains", value: event.target.value },
                { field: "Rented_units", operator: "contains", value: event.target.value },
                ]
            }),
        });
    };

    onClickButton = (event) => {
        if (event === "cancel") {
            this.setState({
                searchButton: false
            })
        }
        if (event === "search") {
            this.setState({
                searchButton: true
            })
        }
        if (event === "add_new_QR_Hash") {
            
            if(this.props.location.pathname === "/all-apartment/grid"){
                this.props.history.push("/all-apartment/grid/add")
            }else{
                this.props.history.push("/qr_hash/grid/add")
            }
        }
    }

    onClickEditButton = () => {
        this.setState({
            flagdisabled: true
        })
    }

    render() {
        return (
            <div>
                <div className="" style={{ margin:"16px" }}>
                    <BreadCrum tenant = {this.state.tenant} new_qr_screen = {true} qr_hash_label={this.state.apartment}/>
                    <br/>
                    <div className="apartment_grid_toolbar_div">
                    <div
                                    style={{ fontFamily: "Roboto ,Helvetica, Arial, sans-serif ", float: "left", marginBottom:"10px", fontSize: "20px", fontWeight: "500", color: "rgba (0,0,0,0.87)" }}
                                >
                                    {this.state.tenant=== true ? 
                                    <span className="Grid-header" style={{color:"#4285F4 !important"}}>{this.state.buildingName}- Apartment</span> : <span className="Grid-header" style={{color:"#4285F4 !important"}}>{this.state.apartment}</span> }
                                {this.state.deleteButton === true ? 
                                    <label style={{ fontFamily: "Roboto ,Helvetica, Arial, sans-serif ", marginLeft: "10px", color: "rgba (0,0,0,0.87)" }}>{this.state.count} row(s) selected</label>
                                    : null}
                                </div>
                                {this.state.searchButton === true ? 
                                            
                                            <Input
                                                className="search-input2"
                                                onChange={this.handleChange}
                                                placeholder="search"
                                                style={{ float: "center", marginLeft: "20px" }}
                                            />
                                        : null}
                                    {this.state.searchButton === true ? 
                                        <button
                                        className="k-button"
                                        name="hello"
                                        onClick={() => { this.onClickButton("cancel") }}
                                        style={{ float: "center", boxShadow: "none", color: "#586069",position: "relative", padding: '0px',
                                        backgroundColor: "#efefef", border: "none", marginLeft:"-25px" }}
                                    >X
                                    </button> : null}
                                    <div style={{display:"flex", float: "right"}}>
                                {this.state.deleteButton === true ? 
                                 <div>
                                {this.state.count > 1 ? 
                                    <div className="editDiv">
                                        <button
                                            className="k-button"
                                            style={{ float: "right", boxShadow: "none", color: "#fff", backgroundColor:"#215CA0" }}
                                            disabled

                                        ><span className="k-icon k-i-pencil"></span>
                                        </button>
                                    </div> :
                                    <div>
                                    <Link
                                        className="k-button"
                                        style={{ float: "right", boxShadow: "none", color: "#fff", backgroundColor:"#215CA0" }}
                                        to="/apartment/grid/edit"
                                    >
                                        <span className="k-icon k-i-pencil"></span>
                                    </Link>
                                    </div>
                                    
                            }</div> : null}
                                {this.state.deleteButton === true ?
                                <button
                                    className="k-button" style={{ float: "right", boxShadow: "none", color: "#fff", backgroundColor:"#215CA0" }}
                                >
                                    <span className="k-icon k-i-delete " ></span>
                                </button>
                                
                                : null
                                }
                                 <button
                                    title="Search"
                                    className="k-button"
                                    onClick={() => { this.onClickButton("search") }}
                                    style={{ float: "right", boxShadow: "none", color: "#fff", backgroundColor:"#215CA0" }}
                                >
                                    <span className="k-icon k-i-zoom k-i-search"></span>
                                </button>
                                <button
                                    title="Export PDF"
                                    className="k-button"
                                    onClick={this.export}
                                    style={{ float: "right", boxShadow: "none", color: "#fff", backgroundColor:"#215CA0" }}
                                >
                                    <span className="k-icon k-i-download"></span>
                                </button>
                                <button
                                    title="Print"
                                    className="k-button"
                                    onClick={this.export}
                                    style={{ float: "right", boxShadow: "none", color: "#fff", backgroundColor:"#215CA0" }}
                                >
                                    <span className="k-icon k-i-print "></span>
                                </button>
                                
                                
                            <button
                                    title="Add"
                                    type="button"
                                    onClick={() => { this.onClickButton("add_new_QR_Hash") }}
                                    className="k-button role-main-Link-plus-button"
                                    style={{ float: "right",color: "#fff", backgroundColor:"#215CA0" }}
                                >
                                    <span
                                        className="k-icon k-i-plus"
                                        style={{ marginLeft: "0px" }}>
                                    </span>
                                </button>
                                </div>
            <ExcelExport
                data={this.state.data}
                ref={exporter => this._export = exporter}
            >
                    <GridToolbar  className="Grid_excel_button">
                               
                    </GridToolbar>
                    <Grid className="apartment_grid_data"
                                style={{ fontFamily: "Roboto ,Helvetica, Arial, sans-serif ", fontSize: "14px", fontWeight: "400" }}
                                data={this.state.data}
                                // data={orderBy(this.state.data,this.state.sort)}
                                skip={this.state.skip}
                                selectedField="selected"
                                onSelectionChange={this.selectionChange}
                                onHeaderSelectionChange={this.headerSelectionChange}
                                take={this.state.take}
                                total={this.state.total}
                                pageable={this.state.pageable}
                                pageSize={this.state.pageSize}
                                onPageChange={this.pageChange}
                                sortable={true}
                                sort={this.state.sort}
                                onSortChange={(e) => {
                                    this.setState({
                                        sort: e.sort
                                    });
                                }}>
                                <Column
                                    className="check-box-color"
                                    field="selected"
                                    width="50px"
                                    marginLeft="100px"
                                    headerSelectionValue={
                                        this.state.data.lenght === 0 ? this.state.data:this.state.data.findIndex(dataItem => dataItem.selected === false) === -1
                                    }
                                />
                               
                                <Column field="ProductName"  title="Product Name" />
                                <Column field="apartment_name" filterable={false} cell={this.CommandCell} title="QR Image"/>
                                <Column field="apartment_name" filterable={false} cell={this.CommandCell2} title="Decode"/>
                    
                </Grid>
            </ExcelExport>

</div>
<footer className="footer-grid" style={{ textAlign: "center" }}>
    <hr />
    &copy; Copyright  {new Date().getFullYear()} All rights reserved
</footer>

</div >

</div>
        );
    }
}
// export default App;

QRHashGrid.propTypes = {
    apartments: PropTypes.object.isRequired
  };
const mapStateToProps = state => ({
    qr_hash: state.apartment
  });

export default connect(mapStateToProps, {  }
    )(QRHashGrid);