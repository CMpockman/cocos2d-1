/****************************************************************************
 Copyright (c) 2012 cocos2d-x.org
 Copyright (c) 2010 Sangwoo Im

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

cc.TABLEVIEW_FILL_TOPDOWN = 0;
cc.TABLEVIEW_FILL_BOTTOMUP = 1;

/**
 * Abstract class for SWTableView cell node
 */
cc.TableViewCell = cc.Node.extend({
    _idx:0,

    /**
     * The index used internally by SWTableView and its subclasses
     */
    getIdx:function () {
        return this._idx;
    },
    setIdx:function (idx) {
        this._idx = idx;
    },

    /**
     * Cleans up any resources linked to this cell and resets <code>idx</code> property.
     */
    reset:function () {
        this._idx = cc.INVALID_INDEX;
    },

    setObjectID:function (idx) {
        this._idx = idx;
    },
    getObjectID:function () {
        return this._idx;
    }
});

/**
 * Sole purpose of this delegate is to single touch event in this version.
 */
cc.TableViewDelegate = cc.ScrollViewDelegate.extend({
    /**
     * Delegate to respond touch event
     *
     * @param {cc.TableView} table table contains the given cell
     * @param {cc.TableViewCell} cell  cell that is touched
     */
    tableCellTouched:function (table, cell) {
    },

    /**
     * Delegate to respond a table cell press event.
     *
     * @param {cc.TableView} table table contains the given cell
     * @param {cc.TableViewCell} cell  cell that is pressed
     */
    tableCellHighlight:function(table, cell){
    },

    /**
     * Delegate to respond a table cell release event
     *
     * @param {cc.TableView} table table contains the given cell
     * @param {cc.TableViewCell} cell  cell that is pressed
     */
    tableCellUnhighlight:function(table, cell){

    },

    /**
     * <p>
     * Delegate called when the cell is about to be recycled. Immediately                     <br/>
     * after this call the cell will be removed from the scene graph and                      <br/>
     * recycled.
     * </p>
     * @param table table contains the given cell
     * @param cell  cell that is pressed
     */
    tableCellWillRecycle:function(table, cell){

    }
});

/**
 * Data source that governs table backend data.
 */
cc.TableViewDataSource = cc.Class.extend({
    /**
     * cell size for a given index
     * @param {cc.TableView} table table to hold the instances of Class
     * @param {Number} idx the index of a cell to get a size
     * @return {cc.Size} size of a cell at given index
     */
    tableCellSizeForIndex:function(table, idx){
        return this.cellSizeForTable(table);
    },
    /**
     * cell height for a given table.
     *
     * @param {cc.TableView} table table to hold the instances of Class
     * @return {cc.Size} cell size
     */
    cellSizeForTable:function (table) {
        return cc.SIZE_ZERO;
    },

    /**
     * a cell instance at a given index
     * @param {cc.TableView} table table to hold the instances of Class
     * @param idx index to search for a cell
     * @return {cc.TableView} cell found at idx
     */
    tableCellAtIndex:function (table, idx) {
        return null;
    },

    /**
     * Returns number of cells in a given table view.
     * @param {cc.TableView} table table to hold the instances of Class
     * @return {Number} number of cells
     */
    numberOfCellsInTableView:function (table) {
        return 0;
    }
});

/**
 * UITableView counterpart for cocos2d for iphone.
 *
 * this is a very basic, minimal implementation to bring UITableView-like component into cocos2d world.
 *
 */
cc.TableView = cc.ScrollView.extend({
    _vOrdering:null,
    _indices:null,
    _cellsFreed:null,
    _dataSource:null,
    _tableViewDelegate:null,
    _oldDirection:null,

    ctor:function () {
        cc.ScrollView.prototype.ctor.call(this);
        this._oldDirection = cc.SCROLLVIEW_DIRECTION_NONE;
    },

    __indexFromOffset:function (offset) {
        var index = 0;
        var cellSize = this._dataSource.cellSizeForTable(this);

        switch (this.getDirection()) {
            case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                index = offset.x / cellSize.width;
                break;
            default:
                index = offset.y / cellSize.height;
                break;
        }
        return index;
    },

    _indexFromOffset:function (offset) {
        var locDataSource = this._dataSource;
        var maxIdx = locDataSource.numberOfCellsInTableView(this) - 1;

        var offset1 = new cc.Point(offset.x, offset.y);

        var cellSize = locDataSource.cellSizeForTable(this);
        if (this._vOrdering == cc.TABLEVIEW_FILL_TOPDOWN) {
            offset1.y = this.getContainer().getContentSize().height - offset.y - cellSize.height;
        }
        var index = Math.max(0, this.__indexFromOffset(offset1));
        index = Math.min(index, maxIdx);

        return index;
    },

    __offsetFromIndex:function (index) {
        var offset;
        var cellSize;

        cellSize = this._dataSource.cellSizeForTable(this);
        switch (this.getDirection()) {
            case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                offset = cc.p(cellSize.width * index, 0.0);
                break;
            default:
                offset = cc.p(0.0, cellSize.height * index);
                break;
        }

        return offset;
    },

    _offsetFromIndex:function (index) {
        var offset = this.__offsetFromIndex(index);

        var cellSize = this._dataSource.cellSizeForTable(this);
        if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN)
            offset.y = this.getContainer().getContentSize().height - offset.y - cellSize.height;

        return offset;
    },

    _updateContentSize:function () {
        var size;

        var cellSize = this._dataSource.cellSizeForTable(this);
        var cellCount = this._dataSource.numberOfCellsInTableView(this);

        switch (this.getDirection()) {
            case cc.SCROLLVIEW_DIRECTION_HORIZONTAL:
                size = cc.size(cellCount * cellSize.width, cellSize.height);
                break;
            default:
                size = cc.size(cellSize.width, cellCount * cellSize.height);
                break;
        }
        this.setContentSize(size);

        if (this._oldDirection != this._direction) {
            if (this._direction == cc.SCROLLVIEW_DIRECTION_HORIZONTAL) {
                this.setContentOffset(cc.p(0, 0));
            } else {
                this.setContentOffset(cc.p(0, this.minContainerOffset().y));
            }
            this._oldDirection = this._direction;
        }
    },

    _cellWithIndex:function (cellIndex) {
        var found = null;

//     if ([this._indices containsIndex:cellIndex])
        if (this._indices.containsObject(cellIndex)) {
            found = this._cellsUsed.objectWithObjectID(cellIndex);
        }

        return found;
    },

    _moveCellOutOfSight:function (cell) {
        this._cellsFreed.addObject(cell);
        this._cellsUsed.removeSortedObject(cell);
        //cc.ArrayRemoveObjectAtIndex(this._indices,cell.getIdx());
        //this._indices.erase(cell.getIdx());
        this._indices.removeObject(cell.getIdx());

        cell.reset();
        if (cell.getParent() == this.getContainer()) {
            this.getContainer().removeChild(cell, true);
        }
    },

    _setIndexForCell:function (index, cell) {
        cell.setAnchorPoint(cc.p(0.0, 0.0));
        cell.setPosition(this._offsetFromIndex(index));
        cell.setIdx(index);
    },

    _addCellIfNecessary:function (cell) {
        if (cell.getParent() != this.getContainer()) {
            this.getContainer().addChild(cell);
        }
        this._cellsUsed.insertSortedObject(cell);
        this._indices.addObject(cell.getIdx());
    },

    /**
     * data source
     */
    getDataSource:function () {
        return this._dataSource;
    },
    setDataSource:function (source) {
        this._dataSource = source;
    },

    /**
     * delegate
     */
    getDelegate:function () {
        return this._tableViewDelegate;
    },

    setDelegate:function (delegate) {
        this._tableViewDelegate = delegate;
    },

    /**
     * determines how cell is ordered and filled in the view.
     */
    setVerticalFillOrder:function (fillOrder) {
        if (this._vOrdering != fillOrder) {
            this._vOrdering = fillOrder;
            if (this._cellsUsed.count() > 0) {
                this.reloadData();
            }
        }
    },
    getVerticalFillOrder:function () {
        return this._vOrdering;
    },

    initWithViewSize:function (size, container) {
        if (cc.ScrollView.prototype.initWithViewSize.call(this, size, container)) {
            this._cellsUsed = new cc.ArrayForObjectSorting();
            this._cellsFreed = new cc.ArrayForObjectSorting();
            this._indices = new cc.Set();
            this._tableViewDelegate = null;
            this._vOrdering = cc.TABLEVIEW_FILL_BOTTOMUP;
            this.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);

            cc.ScrollView.prototype.setDelegate.call(this, this);
            return true;
        }
        return false;
    },

    /**
     * Updates the content of the cell at a given index.
     *
     * @param idx index to find a cell
     */
    updateCellAtIndex:function (idx) {
        if (idx == cc.INVALID_INDEX || idx > this._dataSource.numberOfCellsInTableView(this) - 1) {
            return;
        }

        var cell = this._cellWithIndex(idx);
        if (cell)
            this._moveCellOutOfSight(cell);

        cell = this._dataSource.tableCellAtIndex(this, idx);
        this._setIndexForCell(idx, cell);
        this._addCellIfNecessary(cell);
    },

    /**
     * Inserts a new cell at a given index
     *
     * @param idx location to insert
     */
    insertCellAtIndex:function (idx) {
        if (idx == cc.INVALID_INDEX || idx > this._dataSource.numberOfCellsInTableView(this) - 1) {
            return;
        }

        var newIdx, locCellsUsed = this._cellsUsed;
        var cell = locCellsUsed.objectWithObjectID(idx);
        if (cell) {
            newIdx = locCellsUsed.indexOfSortedObject(cell);
            for (var i = newIdx; i < locCellsUsed.count(); i++) {
                cell = locCellsUsed.objectAtIndex(i);
                this._setIndexForCell(cell.getIdx() + 1, cell);
            }
        }

        //insert a new cell
        cell = this._dataSource.tableCellAtIndex(this, idx);
        this._setIndexForCell(idx, cell);
        this._addCellIfNecessary(cell);

        this._updateContentSize();
    },

    /**
     * Removes a cell at a given index
     *
     * @param idx index to find a cell
     */
    removeCellAtIndex:function (idx) {
        if (idx == cc.INVALID_INDEX || idx > this._dataSource.numberOfCellsInTableView(this) - 1) {
            return;
        }

        var cell = this._cellWithIndex(idx);
        if (!cell)
            return;

        var locCellsUsed = this._cellsUsed;
        var newIdx = locCellsUsed.indexOfSortedObject(cell);

        //remove first
        this._moveCellOutOfSight(cell);

        this._indices.removeObject(idx);
        //cc.ArrayRemoveObjectAtIndex(this._indices,idx);

        for (var i = locCellsUsed.count() - 1; i > newIdx; i--) {
            cell = locCellsUsed.objectAtIndex(i);
            this._setIndexForCell(cell.getIdx() - 1, cell);
        }
    },

    /**
     * reloads data from data source.  the view will be refreshed.
     */
    reloadData:function () {
        this._oldDirection = cc.SCROLLVIEW_DIRECTION_NONE;
        var locCellsUsed = this._cellsUsed, locCellsFreed = this._cellsFreed, locContainer = this.getContainer();
        for (var i = 0; i < locCellsUsed.count(); i++) {
            var cell = locCellsUsed.objectAtIndex(i);
            locCellsFreed.addObject(cell);
            cell.reset();
            if (cell.getParent() == locContainer)
                locContainer.removeChild(cell, true);
        }

        this._indices = new cc.Set();
        this._cellsUsed = new cc.ArrayForObjectSorting();

        this._updateContentSize();
        if (this._dataSource.numberOfCellsInTableView(this) > 0)
            this.scrollViewDidScroll(this);
    },

    /**
     * Dequeues a free cell if available. nil if not.
     *
     * @return free cell
     */
    dequeueCell:function () {
        if (this._cellsFreed.count() == 0) {
            return null;
        } else {
            var cell = this._cellsFreed.objectAtIndex(0);
            this._cellsFreed.removeObjectAtIndex(0);
            return cell;
        }
    },

    /**
     * Returns an existing cell at a given index. Returns nil if a cell is nonexistent at the moment of query.
     *
     * @param idx index
     * @return a cell at a given index
     */
    cellAtIndex:function (idx) {
        return this._cellWithIndex(idx);
    },

    scrollViewDidScroll:function (view) {
        var locDataSource = this._dataSource;
        var countOfItems = locDataSource.numberOfCellsInTableView(this);
        if (0 === countOfItems)
            return;

        if (this._tableViewDelegate != null)
            this._tableViewDelegate.scrollViewDidScroll(this);

        var idx = 0;
        var offset = cc.pMult(this.getContentOffset(), -1);
        var maxIdx = Math.max(locDataSource.numberOfCellsInTableView(this) - 1, 0);

        var cellSize = locDataSource.cellSizeForTable(this);
        var locViewSize = this._viewSize, locContainer = this.getContainer();
        if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN) {
            offset.y = offset.y + locViewSize.height / locContainer.getScaleY() - cellSize.height;
        }
        var startIdx = 0 | this._indexFromOffset(offset);

        if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN) {
            offset.y -= locViewSize.height / locContainer.getScaleY();
        } else {
            offset.y += locViewSize.height / locContainer.getScaleY();
        }
        offset.x += locViewSize.width / locContainer.getScaleX();

        var endIdx = 0 | this._indexFromOffset(offset);

        var cell, locCellsUsed = this._cellsUsed;
        if (locCellsUsed.count() > 0) {
            cell = locCellsUsed.objectAtIndex(0);
            idx = cell.getIdx();
            while (idx < startIdx) {
                this._moveCellOutOfSight(cell);
                if (locCellsUsed.count() > 0) {
                    cell = locCellsUsed.objectAtIndex(0);
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }

        if (locCellsUsed.count() > 0) {
            cell = locCellsUsed.lastObject();
            idx = cell.getIdx();
            while (idx <= maxIdx && idx > endIdx) {
                this._moveCellOutOfSight(cell);
                if (locCellsUsed.count() > 0) {
                    cell = locCellsUsed.lastObject();
                    idx = cell.getIdx();
                } else {
                    break;
                }
            }
        }

        var locIndices = this._indices;
        for (var i = startIdx; i <= endIdx; i++) {
            if (locIndices.containsObject(i))
                continue;
            this.updateCellAtIndex(i);
        }
    },

    scrollViewDidZoom:function (view) {
    },

    onTouchEnded:function (touch, event) {
        if (!this.isVisible())
            return;

        if (this._touches.length == 1 && !this.isTouchMoved()) {
            var point = this.getContainer().convertTouchToNodeSpace(touch);
            if (this._vOrdering === cc.TABLEVIEW_FILL_TOPDOWN) {
                var cellSize = this._dataSource.cellSizeForTable(this);
                point.y -= cellSize.height;
            }
            var index = 0 | this._indexFromOffset(point);
            var cell = this._cellWithIndex(index);

            if (cell)
                this._tableViewDelegate.tableCellTouched(this, cell);
        }
        cc.ScrollView.prototype.onTouchEnded.call(this, touch, event);
    }
});

/**
 * An initialized table view object
 *
 * @param {cc.TableViewDataSource} dataSource data source;
 * @param {cc.Size} size view size
 * @param {cc.Node} container parent object for cells
 * @return {cc.TableView} table view
 */
cc.TableView.create = function (dataSource, size, container) {
    var table = new cc.TableView();
    table.initWithViewSize(size, container);
    table.setDataSource(dataSource);
    table._updateContentSize();
    return table;
};
