// This file is part of MinIO Kubernetes Cloud
// Copyright (c) 2020 MinIO, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import React, { useState, useEffect } from "react";
import get from "lodash/get";
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { LinearProgress } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Title from "../../../common/Title";
import { UsersList } from "../Users/types";
import { usersSort } from "../../../utils/sortFunctions";
import api from "../../../common/api";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchIcon from "@material-ui/icons/Search";
import TableWrapper from "../Common/TableWrapper/TableWrapper";

interface IGroupsProps {
  classes: any;
  selectedUsers: string[];
  setSelectedUsers: any;
}

const styles = (theme: Theme) =>
  createStyles({
    seeMore: {
      marginTop: theme.spacing(3),
    },
    paper: {
      // padding: theme.spacing(2),
      display: "flex",
      overflow: "auto",
      flexDirection: "column",
    },
    addSideBar: {
      width: "320px",
      padding: "20px",
    },
    errorBlock: {
      color: "red",
    },
    tableToolbar: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(0),
    },
    wrapCell: {
      maxWidth: "200px",
      whiteSpace: "normal",
      wordWrap: "break-word",
    },
    minTableHeader: {
      color: "#393939",
      "& tr": {
        "& th": {
          fontWeight: "bold",
        },
      },
    },
    actionsTray: {
      textAlign: "left",
      "& button": {
        marginLeft: 10,
      },
    },
    filterField: {
      background: "#FFFFFF",
      padding: 12,
      borderRadius: 5,
      boxShadow: "0px 3px 6px #00000012",
      width: "100%",
      zIndex: 500,
    },
    noFound: {
      textAlign: "center",
      padding: "10px 0",
    },
    tableContainer: {
      maxHeight: 250,
    },
    stickyHeader: {
      backgroundColor: "#fff",
    },
  });

const UsersSelectors = ({
  classes,
  selectedUsers,
  setSelectedUsers,
}: IGroupsProps) => {
  //Local States
  const [records, setRecords] = useState<any[]>([]);
  const [loading, isLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  //Effects
  useEffect(() => {
    isLoading(true);
  }, []);

  useEffect(() => {
    if (loading) {
      fetchUsers();
    }
  }, [loading]);

  const selUsers = !selectedUsers ? [] : selectedUsers;

  //Fetch Actions
  const selectionChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetD = e.target;
    const value = targetD.value;
    const checked = targetD.checked;

    let elements: string[] = [...selUsers]; // We clone the selectedGroups array

    if (checked) {
      // If the user has checked this field we need to push this to selectedGroupsList
      elements.push(value);
    } else {
      // User has unchecked this field, we need to remove it from the list
      elements = elements.filter((element) => element !== value);
    }
    setSelectedUsers(elements);

    return elements;
  };

  const fetchUsers = () => {
    api
      .invoke("GET", `/api/v1/users`)
      .then((res: UsersList) => {
        let users = get(res, "users", []);

        if (!users) {
          users = [];
        }

        setRecords(users.sort(usersSort));
        setError("");
        isLoading(false);
      })
      .catch((err) => {
        setError(err);
        isLoading(false);
      });
  };

  const filteredRecords = records.filter((elementItem) =>
    elementItem.accessKey.includes(filter)
  );

  return (
    <React.Fragment>
      <Title>Assign Users</Title>
      {error !== "" ? <div>{error}</div> : <React.Fragment />}
      <Grid item xs={12}>
        <Paper className={classes.paper}>
          {loading && <LinearProgress />}
          {records != null && records.length > 0 ? (
            <React.Fragment>
              <Grid item xs={12} className={classes.actionsTray}>
                <TextField
                  placeholder="Filter Groups"
                  className={classes.filterField}
                  id="search-resource"
                  label=""
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  onChange={(e) => {
                    setFilter(e.target.value);
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TableWrapper
                  columns={[{ label: "Access Key", elementKey: "accessKey" }]}
                  onSelect={selectionChanged}
                  selectedItems={selUsers}
                  isLoading={loading}
                  records={filteredRecords}
                  entityName="Users"
                  idField="accessKey"
                />
              </Grid>
            </React.Fragment>
          ) : (
            <div className={classes.noFound}>No Users Available</div>
          )}
        </Paper>
      </Grid>
    </React.Fragment>
  );
};

export default withStyles(styles)(UsersSelectors);
