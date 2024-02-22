/*
* Copyright (c) 2024. caoccao.com Sam Cao
* All rights reserved.

* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at

* http://www.apache.org/licenses/LICENSE-2.0

* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

use chrono::{DateTime, Local, Timelike};
use clap::Parser;
use dateparser::parse;
use filetime::{set_file_atime, set_file_mtime, set_file_times, FileTime};
use pretty_duration::pretty_duration;
use std::fs::File;
use std::path::Path;
use std::thread::sleep;
use std::time::Duration;

#[derive(Parser, Debug)]
#[command(name = "touch")]
#[command(version = "0.1.0")]
#[command(about = "Update the access and modification times of each FILE to the current time.")]
#[command(long_about=None)]
#[clap(author = "Sam Cao", version = "0.1.0", about = "Touch for Windows")]
struct Args {
    /// change only the access time
    #[arg(short, default_value_t = false)]
    access_time_only: bool,

    /// change only the modification time
    #[arg(short, default_value_t = false)]
    modification_time_only: bool,

    /// parse STRING and use it instead of current time
    #[arg(short, long, value_name = "STRING")]
    date: Option<String>,

    /// do not create any files
    #[arg(short = 'c', long = "no-create", default_value_t = false)]
    no_create: bool,

    /// touch repeatedly per interval (milliseconds)
    #[arg(short, long, default_value_t = 0)]
    interval: u64,

    /// print the log
    #[arg(short, long, default_value_t = false)]
    log: bool,

    /// A FILE argument string
    #[arg(name = "FILE")]
    files: Vec<String>,
}

fn main() {
    let args = Args::parse();
    if args.files.is_empty() {
        println!("File list is empty.");
    } else {
        let mut timestamp: DateTime<Local> = if let Some(ref date) = args.date {
            match parse(&date) {
                Ok(result) => result.with_timezone(&Local),
                Err(_) => Local::now(),
            }
        } else {
            Local::now()
        };
        let optional_duration = if args.interval > 0 {
            Some(Duration::from_millis(args.interval))
        } else {
            None
        };
        loop {
            let now = Local::now();
            let log_prefix = now.format("%Y-%m-%d %H:%M:%S");
            if args.date.is_none() {
                timestamp = now.clone();
            }
            let file_time = FileTime::from_unix_time(timestamp.timestamp(), timestamp.nanosecond());
            for file_name in args.files.iter() {
                let path = Path::new(file_name);
                if path.exists() {
                    if args.access_time_only {
                        let _ = set_file_atime(path, file_time);
                    } else if args.modification_time_only {
                        let _ = set_file_mtime(path, file_time);
                    } else {
                        let _ = set_file_times(path, file_time, file_time);
                    }
                    if args.log {
                        println!("{} - Touched {}", log_prefix, file_name)
                    }
                } else {
                    if args.no_create {
                        if args.log {
                            println!("{} - Ignored creating {}", log_prefix, file_name);
                        }
                    } else {
                        let _ = File::create(file_name);
                        if args.log {
                            println!("{} - Created {}", log_prefix, file_name)
                        }
                    }
                }
            }
            if let Some(duration) = optional_duration {
                if args.log {
                    println!(
                        "{} - Sleep {}.",
                        log_prefix,
                        pretty_duration(&duration, None)
                    )
                }
                sleep(duration);
            } else {
                break;
            }
        }
    }
}
